import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CampaignRequest {
  action: 'create' | 'fetch_video_metadata' | 'update_status' | 'get_analytics'
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
    // Validate authentication
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get authenticated user from JWT
    const token = authHeader.replace('Bearer ', '')
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!
    )

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)

    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const authenticatedUserId = user.id

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
        // Validate input
        if (!params.videoUrl || typeof params.videoUrl !== 'string') {
          throw new Error('Invalid videoUrl')
        }
        if (params.videoUrl.length > 500) {
          throw new Error('URL too long')
        }
        result = await fetchVideoMetadata(params.videoUrl, youtubeApiKey)
        break
      
      case 'create':
        // Validate all inputs
        if (!params.videoUrl || typeof params.videoUrl !== 'string' || params.videoUrl.length > 500) {
          throw new Error('Invalid videoUrl')
        }
        if (!params.title || typeof params.title !== 'string' || params.title.length < 3 || params.title.length > 200) {
          throw new Error('Title must be between 3 and 200 characters')
        }
        if (!params.creditsAllocated || typeof params.creditsAllocated !== 'number' || 
            params.creditsAllocated < 1 || params.creditsAllocated > 100000 || 
            !Number.isInteger(params.creditsAllocated)) {
          throw new Error('Credits must be between 1 and 100,000')
        }
        if (!params.targetActions || typeof params.targetActions !== 'number' || 
            params.targetActions < 1 || params.targetActions > 10000 || 
            !Number.isInteger(params.targetActions)) {
          throw new Error('Target actions must be between 1 and 10,000')
        }

        // Validate user has enough credits
        const { data: profile } = await supabase
          .from('profiles')
          .select('credits')
          .eq('id', authenticatedUserId)
          .single()

        if (!profile || profile.credits < params.creditsAllocated) {
          throw new Error('Insufficient credits')
        }

        result = await createCampaignWithTasks(
          supabase,
          authenticatedUserId, // Use authenticated user ID, not client-provided
          params.videoUrl,
          params.title.trim(),
          params.creditsAllocated,
          params.targetActions,
          youtubeApiKey
        )
        break
      
      case 'update_status':
        if (!params.campaignId || typeof params.campaignId !== 'string') {
          throw new Error('Invalid campaignId')
        }
        if (!params.status || !['active', 'paused', 'completed', 'cancelled'].includes(params.status)) {
          throw new Error('Invalid status')
        }

        // Verify user owns the campaign
        const { data: campaign } = await supabase
          .from('campaigns')
          .select('user_id')
          .eq('id', params.campaignId)
          .single()

        if (!campaign || campaign.user_id !== authenticatedUserId) {
          throw new Error('Unauthorized to update this campaign')
        }

        result = await updateCampaignStatus(
          supabase,
          params.campaignId,
          params.status
        )
        break
      
      case 'get_analytics':
        if (!params.campaignId || typeof params.campaignId !== 'string') {
          throw new Error('Invalid campaignId')
        }

        // Verify user owns the campaign
        const { data: campaignForAnalytics } = await supabase
          .from('campaigns')
          .select('user_id')
          .eq('id', params.campaignId)
          .single()

        if (!campaignForAnalytics || campaignForAnalytics.user_id !== authenticatedUserId) {
          throw new Error('Unauthorized to view this campaign')
        }

        result = await getCampaignAnalytics(supabase, params.campaignId)
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
        status: error instanceof Error && error.message.includes('Unauthorized') ? 403 : 400
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
  
  // Distribute tasks evenly across types based on credits available
  const watchTasks = Math.floor(targetActions * 0.5) // 50% watch tasks (1 credit each)
  const likeTasks = Math.floor(targetActions * 0.3)  // 30% like tasks (2 credits each)
  const subscribeTasks = targetActions - watchTasks - likeTasks // Remaining as subscribe (5 credits each)
  
  // Create watch tasks
  for (let i = 0; i < watchTasks; i++) {
    tasks.push({
      video_id: videoId,
      task_type: 'watch',
      credits_reward: 1,
      created_by: userId,
      status: 'pending'
    })
  }
  
  // Create like tasks
  for (let i = 0; i < likeTasks; i++) {
    tasks.push({
      video_id: videoId,
      task_type: 'like',
      credits_reward: 2,
      created_by: userId,
      status: 'pending'
    })
  }
  
  // Create subscribe tasks
  for (let i = 0; i < subscribeTasks; i++) {
    tasks.push({
      video_id: videoId,
      task_type: 'subscribe',
      credits_reward: 5,
      created_by: userId,
      status: 'pending'
    })
  }

  console.log(`Creating ${tasks.length} tasks for campaign ${campaignId}`)
  
  const { data: createdTasks, error: tasksError } = await supabase
    .from('tasks')
    .insert(tasks)
    .select()

  if (tasksError) {
    console.error('Error creating tasks:', tasksError)
    throw tasksError
  }

  console.log(`Successfully created ${createdTasks?.length || 0} tasks`)

  return { 
    campaignId, 
    videoMetadata, 
    tasksCreated: createdTasks?.length || 0,
    taskBreakdown: {
      watch: watchTasks,
      like: likeTasks,
      subscribe: subscribeTasks
    }
  }
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