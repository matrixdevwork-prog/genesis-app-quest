import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface GamificationRequest {
  action: 'calculate_xp' | 'check_achievements' | 'update_streak' | 'get_leaderboard' | 'daily_reward'
  userId?: string
  taskType?: 'watch' | 'like' | 'subscribe'
  limit?: number
}

const XP_REWARDS = {
  watch: 10,
  like: 20,
  subscribe: 50
}

const LEVEL_THRESHOLDS = [
  0, 100, 250, 500, 1000, 2000, 3500, 5500, 8000, 12000, 17000, 23000, 30000, 40000, 50000
]

const ACHIEVEMENTS = [
  { id: 'first_task', name: 'Getting Started', description: 'Complete your first task', requirement: 1 },
  { id: 'task_master', name: 'Task Master', description: 'Complete 10 tasks', requirement: 10 },
  { id: 'dedicated_earner', name: 'Dedicated Earner', description: 'Complete 50 tasks', requirement: 50 },
  { id: 'super_user', name: 'Super User', description: 'Complete 100 tasks', requirement: 100 },
  { id: 'week_streak', name: 'Week Warrior', description: 'Login for 7 consecutive days', requirement: 7 },
  { id: 'month_streak', name: 'Monthly Master', description: 'Login for 30 consecutive days', requirement: 30 },
  { id: 'subscriber_specialist', name: 'Subscriber Specialist', description: 'Complete 20 subscription tasks', requirement: 20 },
  { id: 'like_legend', name: 'Like Legend', description: 'Complete 50 like tasks', requirement: 50 }
]

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { action, ...params }: GamificationRequest = await req.json()
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    let result

    switch (action) {
      case 'calculate_xp':
        result = await calculateAndAwardXP(supabase, params.userId!, params.taskType!)
        break
      
      case 'check_achievements':
        result = await checkAndAwardAchievements(supabase, params.userId!)
        break
      
      case 'update_streak':
        result = await updateDailyStreak(supabase, params.userId!)
        break
      
      case 'get_leaderboard':
        result = await getLeaderboard(supabase, params.limit || 10)
        break
      
      case 'daily_reward':
        result = await claimDailyReward(supabase, params.userId!)
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
    console.error('Gamification error:', error)
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})

async function calculateAndAwardXP(supabase: any, userId: string, taskType: string) {
  const xpReward = XP_REWARDS[taskType as keyof typeof XP_REWARDS] || 10
  
  // Get current user profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('xp, level')
    .eq('id', userId)
    .single()

  if (profileError) throw profileError

  const newXP = profile.xp + xpReward
  const newLevel = calculateLevel(newXP)
  const leveledUp = newLevel > profile.level

  // Update user XP and level
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ 
      xp: newXP, 
      level: newLevel,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)

  if (updateError) throw updateError

  // Record XP transaction
  await supabase
    .from('credit_transactions')
    .insert({
      user_id: userId,
      amount: xpReward,
      transaction_type: 'xp_earned',
      description: `XP earned from ${taskType} task`,
      reference_id: userId
    })

  return {
    xpAwarded: xpReward,
    newXP,
    newLevel,
    leveledUp,
    nextLevelXP: LEVEL_THRESHOLDS[newLevel] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1]
  }
}

async function checkAndAwardAchievements(supabase: any, userId: string) {
  // Get user task completion stats
  const { data: taskStats, error: statsError } = await supabase
    .from('user_tasks')
    .select('task_id, tasks(task_type)')
    .eq('user_id', userId)
    .eq('status', 'completed')

  if (statsError) throw statsError

  const totalTasks = taskStats.length
  const subscriptionTasks = taskStats.filter((task: any) => task.tasks?.task_type === 'subscribe').length
  const likeTasks = taskStats.filter((task: any) => task.tasks?.task_type === 'like').length

  // Get current streak
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('streak_count')
    .eq('id', userId)
    .single()

  if (profileError) throw profileError

  const newAchievements = []

  // Check each achievement
  for (const achievement of ACHIEVEMENTS) {
    let qualifies = false

    switch (achievement.id) {
      case 'first_task':
      case 'task_master':
      case 'dedicated_earner':
      case 'super_user':
        qualifies = totalTasks >= achievement.requirement
        break
      case 'week_streak':
      case 'month_streak':
        qualifies = profile.streak_count >= achievement.requirement
        break
      case 'subscriber_specialist':
        qualifies = subscriptionTasks >= achievement.requirement
        break
      case 'like_legend':
        qualifies = likeTasks >= achievement.requirement
        break
    }

    if (qualifies) {
      // Check if user already has this achievement
      const { data: existing } = await supabase
        .from('user_achievements')
        .select('id')
        .eq('user_id', userId)
        .eq('achievement_id', achievement.id)
        .single()

      if (!existing) {
        // Award achievement
        await supabase
          .from('user_achievements')
          .insert({
            user_id: userId,
            achievement_id: achievement.id,
            earned_at: new Date().toISOString()
          })

        newAchievements.push(achievement)

        // Award bonus credits for achievement
        await supabase.rpc('add_credits', {
          target_user_id: userId,
          credit_amount: 50,
          transaction_type: 'achievement_bonus',
          description: `Achievement bonus: ${achievement.name}`
        })
      }
    }
  }

  return { newAchievements, totalChecked: ACHIEVEMENTS.length }
}

async function updateDailyStreak(supabase: any, userId: string) {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('last_login_date, streak_count')
    .eq('id', userId)
    .single()

  if (error) throw error

  const today = new Date().toDateString()
  const lastLogin = profile.last_login_date ? new Date(profile.last_login_date).toDateString() : null
  const yesterday = new Date(Date.now() - 86400000).toDateString()

  let newStreakCount = profile.streak_count || 0

  if (lastLogin === today) {
    // Already logged in today
    return { streakCount: newStreakCount, streakBroken: false, bonusAwarded: false }
  }

  if (lastLogin === yesterday) {
    // Consecutive day login
    newStreakCount++
  } else if (lastLogin !== null) {
    // Streak broken
    newStreakCount = 1
  } else {
    // First login
    newStreakCount = 1
  }

  // Update profile
  await supabase
    .from('profiles')
    .update({
      last_login_date: new Date().toISOString().split('T')[0],
      streak_count: newStreakCount,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)

  // Award streak bonus
  let bonusAwarded = false
  if (newStreakCount % 7 === 0) {
    // Weekly streak bonus
    await supabase.rpc('add_credits', {
      target_user_id: userId,
      credit_amount: 25,
      transaction_type: 'streak_bonus',
      description: `Weekly streak bonus (${newStreakCount} days)`
    })
    bonusAwarded = true
  }

  return { 
    streakCount: newStreakCount, 
    streakBroken: lastLogin !== null && lastLogin !== yesterday,
    bonusAwarded
  }
}

async function getLeaderboard(supabase: any, limit: number) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, username, level, xp, avatar_url')
    .order('level', { ascending: false })
    .order('xp', { ascending: false })
    .limit(limit)

  if (error) throw error

  return data.map((profile: any, index: number) => ({
    ...profile,
    rank: index + 1
  }))
}

async function claimDailyReward(supabase: any, userId: string) {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('last_login_date, streak_count')
    .eq('id', userId)
    .single()

  if (error) throw error

  const today = new Date().toDateString()
  const lastLogin = profile.last_login_date ? new Date(profile.last_login_date).toDateString() : null

  if (lastLogin === today) {
    // Already claimed today
    return { claimed: false, reason: 'Already claimed today' }
  }

  // Calculate reward based on streak
  const baseReward = 10
  const streakBonus = Math.min(profile.streak_count * 2, 50) // Max 50 bonus
  const totalReward = baseReward + streakBonus

  // Award daily reward
  await supabase.rpc('add_credits', {
    target_user_id: userId,
    credit_amount: totalReward,
    transaction_type: 'daily_reward',
    description: `Daily login reward (${totalReward} credits)`
  })

  return { 
    claimed: true, 
    reward: totalReward,
    baseReward,
    streakBonus,
    streakCount: profile.streak_count
  }
}

function calculateLevel(xp: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) {
      return i + 1
    }
  }
  return 1
}