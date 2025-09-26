import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CampaignRequest {
  action: 'create' | 'fetch_video_metadata' | 'update_status' | 'get_analytics'
  userId?: string
  videoUrl?: string
  title?: string
  creditsAllocated?: number
  targetActions?: number
  campaignId?: string
  status?: 'active' | 'paused' | 'completed' | 'cancelled'
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { action, ...params }: CampaignRequest = await req.json()
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const youtubeApiKey = Deno.env.get('YOUTUBE_API_KEY')
    if (!youtubeApiKey) {
      throw new Error('YouTube API key not configured')
    }

    let result

    switch (action) {
      case 'fetch_video_metadata':
        result = await fetchVideoMetadata(params.videoUrl!, youtubeApiKey)
        break
      
      case 'create':
        result = await createCampaignWithTasks(
          supabase,
          params.userId!,
          params.videoUrl!,
          params.title!,
          params.creditsAllocated!,
          params.targetActions!,
          youtubeApiKey
        )
        break
      
      case 'update_status':
        result = await updateCampaignStatus(
          supabase,
          params.campaignId!,
          params.status!
        )
        break
      
      case 'get_analytics':
        result = await getCampaignAnalytics(supabase, params.campaignId!)
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
    console.error('Campaign management error:', error)
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})

async function fetchVideoMetadata(videoUrl: string, apiKey: string) {
  const videoId = extractVideoId(videoUrl)
  if (!videoId) {
    throw new Error('Invalid YouTube URL')
  }

  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${videoId}&key=${apiKey}`
  )
  
  const data = await response.json()
  
  if (!data.items || data.items.length === 0) {
    throw new Error('Video not found')
  }

  const video = data.items[0]
  
  return {
    videoId,
    title: video.snippet.title,
    description: video.snippet.description,
    channelName: video.snippet.channelTitle,
    channelId: video.snippet.channelId,
    thumbnailUrl: video.snippet.thumbnails.high?.url || video.snippet.thumbnails.default?.url,
    duration: parseDuration(video.contentDetails.duration),
    viewCount: parseInt(video.statistics.viewCount || '0'),
    likeCount: parseInt(video.statistics.likeCount || '0')
  }
}

async function createCampaignWithTasks(
  supabase: any,
  userId: string,
  videoUrl: string,
  title: string,
  creditsAllocated: number,
  targetActions: number,
  apiKey: string
) {
  // First, fetch video metadata
  const videoMetadata = await fetchVideoMetadata(videoUrl, apiKey)
  
  // Create or get video record
  const { data: existingVideo } = await supabase
    .from('videos')
    .select('id')
    .eq('youtube_id', videoMetadata.videoId)
    .single()

  let videoId = existingVideo?.id

  if (!videoId) {
    const { data: newVideo, error: videoError } = await supabase
      .from('videos')
      .insert({
        youtube_id: videoMetadata.videoId,
        title: videoMetadata.title,
        description: videoMetadata.description,
        channel_name: videoMetadata.channelName,
        thumbnail_url: videoMetadata.thumbnailUrl,
        duration: videoMetadata.duration
      })
      .select('id')
      .single()

    if (videoError) throw videoError
    videoId = newVideo.id
  }

  // Create campaign using the database function
  const { data: campaignId, error: campaignError } = await supabase.rpc('create_campaign', {
    p_user_id: userId,
    p_video_id: videoId,
    p_title: title,
    p_credits_allocated: creditsAllocated,
    p_target_actions: targetActions
  })

  if (campaignError) throw campaignError

  // Create tasks for the campaign
  const tasks = []
  const creditsPerAction = Math.floor(creditsAllocated / targetActions)
  
  // Create tasks based on target actions
  for (let i = 0; i < targetActions; i++) {
    const taskTypes = ['watch', 'like', 'subscribe']
    const taskType = taskTypes[i % taskTypes.length]
    const credits = taskType === 'watch' ? 1 : taskType === 'like' ? 2 : 5
    
    tasks.push({
      video_id: videoId,
      task_type: taskType,
      credits_reward: credits,
      created_by: userId,
      status: 'pending'
    })
  }

  const { error: tasksError } = await supabase
    .from('tasks')
    .insert(tasks)

  if (tasksError) throw tasksError

  return { campaignId, videoMetadata, tasksCreated: tasks.length }
}

async function updateCampaignStatus(supabase: any, campaignId: string, status: string) {
  const { data, error } = await supabase
    .from('campaigns')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', campaignId)
    .select()
    .single()

  if (error) throw error
  return data
}

async function getCampaignAnalytics(supabase: any, campaignId: string) {
  // Get campaign details
  const { data: campaign, error: campaignError } = await supabase
    .from('campaigns')
    .select('*')
    .eq('id', campaignId)
    .single()

  if (campaignError) throw campaignError

  // Get task completion statistics
  const { data: taskStats, error: statsError } = await supabase
    .from('tasks')
    .select('status, credits_reward')
    .eq('created_by', campaign.user_id)

  if (statsError) throw statsError

  const completedTasks = taskStats.filter((task: any) => task.status === 'completed')
  const totalCreditsSpent = completedTasks.reduce((sum: number, task: any) => sum + task.credits_reward, 0)
  const completionRate = taskStats.length > 0 ? (completedTasks.length / taskStats.length) * 100 : 0

  return {
    campaign,
    totalTasks: taskStats.length,
    completedTasks: completedTasks.length,
    totalCreditsSpent,
    completionRate: Math.round(completionRate * 100) / 100,
    remainingCredits: campaign.credits_allocated - totalCreditsSpent
  }
}

function extractVideoId(url: string): string | null {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
  const match = url.match(regex)
  return match ? match[1] : null
}

function parseDuration(duration: string): number {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/)
  if (!match) return 0
  
  const hours = parseInt(match[1]?.replace('H', '') || '0')
  const minutes = parseInt(match[2]?.replace('M', '') || '0')
  const seconds = parseInt(match[3]?.replace('S', '') || '0')
  
  return hours * 3600 + minutes * 60 + seconds
}