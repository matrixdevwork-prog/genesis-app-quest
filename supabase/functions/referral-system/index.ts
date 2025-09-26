import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ReferralRequest {
  action: 'process_referral' | 'get_referral_stats' | 'generate_code' | 'validate_code'
  userId?: string
  referralCode?: string
  newUserId?: string
}

const REFERRAL_BONUS = {
  referrer: 100,  // Credits for the person who referred
  referee: 50     // Credits for the new user
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { action, ...params }: ReferralRequest = await req.json()
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    let result

    switch (action) {
      case 'process_referral':
        result = await processReferral(supabase, params.referralCode!, params.newUserId!)
        break
      
      case 'get_referral_stats':
        result = await getReferralStats(supabase, params.userId!)
        break
      
      case 'generate_code':
        result = await generateReferralCode(supabase, params.userId!)
        break
      
      case 'validate_code':
        result = await validateReferralCode(supabase, params.referralCode!)
        break
      
      default:
        throw new Error(`Unknown action: ${action}`)
    }

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Referral system error:', error)
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})

async function processReferral(supabase: any, referralCode: string, newUserId: string) {
  // Find the referrer
  const { data: referrer, error: referrerError } = await supabase
    .from('profiles')
    .select('id, full_name, referral_code')
    .eq('referral_code', referralCode)
    .single()

  if (referrerError || !referrer) {
    throw new Error('Invalid referral code')
  }

  if (referrer.id === newUserId) {
    throw new Error('Cannot refer yourself')
  }

  // Check if new user already has a referrer
  const { data: existingReferral } = await supabase
    .from('profiles')
    .select('referred_by')
    .eq('id', newUserId)
    .single()

  if (existingReferral?.referred_by) {
    throw new Error('User already has a referrer')
  }

  // Update new user's profile with referrer
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ 
      referred_by: referrer.id,
      updated_at: new Date().toISOString()
    })
    .eq('id', newUserId)

  if (updateError) throw updateError

  // Award credits to referrer
  await supabase.rpc('add_credits', {
    target_user_id: referrer.id,
    credit_amount: REFERRAL_BONUS.referrer,
    transaction_type: 'referral_bonus',
    reference_id: newUserId,
    description: `Referral bonus for inviting new user`
  })

  // Award credits to new user
  await supabase.rpc('add_credits', {
    target_user_id: newUserId,
    credit_amount: REFERRAL_BONUS.referee,
    transaction_type: 'referral_bonus',
    reference_id: referrer.id,
    description: `Welcome bonus from referral`
  })

  // Record referral event
  await supabase
    .from('referral_events')
    .insert({
      referrer_id: referrer.id,
      referee_id: newUserId,
      referral_code: referralCode,
      bonus_awarded: REFERRAL_BONUS.referrer + REFERRAL_BONUS.referee,
      created_at: new Date().toISOString()
    })

  return {
    referrer: {
      id: referrer.id,
      name: referrer.full_name,
      bonusAwarded: REFERRAL_BONUS.referrer
    },
    referee: {
      id: newUserId,
      bonusAwarded: REFERRAL_BONUS.referee
    },
    totalBonusAwarded: REFERRAL_BONUS.referrer + REFERRAL_BONUS.referee
  }
}

async function getReferralStats(supabase: any, userId: string) {
  // Get referral code
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('referral_code')
    .eq('id', userId)
    .single()

  if (profileError) throw profileError

  // Get referred users count
  const { data: referredUsers, error: referredError } = await supabase
    .from('profiles')
    .select('id, full_name, created_at')
    .eq('referred_by', userId)

  if (referredError) throw referredError

  // Get total referral earnings
  const { data: referralEarnings, error: earningsError } = await supabase
    .from('credit_transactions')
    .select('amount')
    .eq('user_id', userId)
    .eq('transaction_type', 'referral_bonus')

  if (earningsError) throw earningsError

  const totalEarnings = referralEarnings.reduce((sum: number, transaction: any) => sum + transaction.amount, 0)

  // Get recent referrals (last 30 days)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const recentReferrals = referredUsers.filter((user: any) => user.created_at >= thirtyDaysAgo)

  return {
    referralCode: profile.referral_code,
    totalReferrals: referredUsers.length,
    recentReferrals: recentReferrals.length,
    totalEarnings,
    referredUsers: referredUsers.map((user: any) => ({
      id: user.id,
      name: user.full_name,
      joinedAt: user.created_at
    }))
  }
}

async function generateReferralCode(supabase: any, userId: string) {
  // Generate a unique 8-character code
  const code = generateUniqueCode()
  
  // Check if code already exists
  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .eq('referral_code', code)
    .single()

  if (existing) {
    // If code exists, try again (recursive)
    return await generateReferralCode(supabase, userId)
  }

  // Update user's referral code
  const { error } = await supabase
    .from('profiles')
    .update({ 
      referral_code: code,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)

  if (error) throw error

  return { referralCode: code }
}

async function validateReferralCode(supabase: any, referralCode: string) {
  const { data: referrer, error } = await supabase
    .from('profiles')
    .select('id, full_name, referral_code')
    .eq('referral_code', referralCode)
    .single()

  if (error || !referrer) {
    return { valid: false, message: 'Invalid referral code' }
  }

  return {
    valid: true,
    referrer: {
      id: referrer.id,
      name: referrer.full_name
    },
    bonuses: REFERRAL_BONUS
  }
}

function generateUniqueCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}