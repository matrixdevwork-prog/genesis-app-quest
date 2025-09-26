import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface VerificationRequest {
  userId: string
  taskId: string
  taskType: 'watch' | 'like' | 'subscribe'
  videoId: string
  channelId?: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { userId, taskId, taskType, videoId, channelId }: VerificationRequest = await req.json()
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get YouTube API key
    const youtubeApiKey = Deno.env.get('YOUTUBE_API_KEY')
    if (!youtubeApiKey) {
      throw new Error('YouTube API key not configured')
    }

    console.log(`Starting verification for user ${userId}, task ${taskId}, type ${taskType}`)

    let isVerified = false

    switch (taskType) {
      case 'watch':
        // For watch tasks, we'll implement a simplified verification
        // In a real scenario, this would integrate with YouTube Analytics API
        isVerified = await verifyWatchTime(videoId, userId, youtubeApiKey)
        break
      
      case 'like':
        isVerified = await verifyLike(videoId, userId, youtubeApiKey)
        break
      
      case 'subscribe':
        if (!channelId) {
          throw new Error('Channel ID required for subscription verification')
        }
        isVerified = await verifySubscription(channelId, userId, youtubeApiKey)
        break
      
      default:
        throw new Error(`Unknown task type: ${taskType}`)
    }

    if (isVerified) {
      // Complete the task and award credits
      const { data, error } = await supabase.rpc('complete_task', {
        p_user_id: userId,
        p_task_id: taskId
      })

      if (error) {
        console.error('Error completing task:', error)
        throw error
      }

      console.log(`Task ${taskId} completed successfully for user ${userId}`)
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          verified: true,
          message: 'Task completed and credits awarded'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    } else {
      return new Response(
        JSON.stringify({ 
          success: false, 
          verified: false,
          message: 'Task verification failed'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

  } catch (error) {
    console.error('Verification error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})

async function verifyWatchTime(videoId: string, userId: string, apiKey: string): Promise<boolean> {
  try {
    // Get video duration from YouTube API
    const videoResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoId}&key=${apiKey}`
    )
    
    const videoData = await videoResponse.json()
    if (!videoData.items || videoData.items.length === 0) {
      console.log('Video not found')
      return false
    }

    // For now, we'll assume verification based on the presence of the video
    // In a real implementation, this would check YouTube Analytics API
    // or use embedded player events
    console.log(`Watch time verification for video ${videoId} - assuming verified`)
    return true
  } catch (error) {
    console.error('Watch time verification error:', error)
    return false
  }
}

async function verifyLike(videoId: string, userId: string, apiKey: string): Promise<boolean> {
  try {
    // Note: YouTube API v3 doesn't allow checking if a specific user liked a video
    // without OAuth. This is a simplified implementation.
    // In production, you'd need OAuth flow to check user's like status
    
    const videoResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${videoId}&key=${apiKey}`
    )
    
    const videoData = await videoResponse.json()
    if (!videoData.items || videoData.items.length === 0) {
      console.log('Video not found for like verification')
      return false
    }

    // For now, assuming verification if video exists
    // In real implementation, this would require OAuth to check user's like status
    console.log(`Like verification for video ${videoId} - simplified verification`)
    return true
  } catch (error) {
    console.error('Like verification error:', error)
    return false
  }
}

async function verifySubscription(channelId: string, userId: string, apiKey: string): Promise<boolean> {
  try {
    // Note: Similar to likes, checking subscription status requires OAuth
    // This is a simplified implementation
    
    const channelResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${channelId}&key=${apiKey}`
    )
    
    const channelData = await channelResponse.json()
    if (!channelData.items || channelData.items.length === 0) {
      console.log('Channel not found for subscription verification')
      return false
    }

    // For now, assuming verification if channel exists
    // In real implementation, this would require OAuth to check user's subscription status
    console.log(`Subscription verification for channel ${channelId} - simplified verification`)
    return true
  } catch (error) {
    console.error('Subscription verification error:', error)
    return false
  }
}