import { NextRequest } from 'next/server'
import { createSSEStream } from '@/lib/sse/manager'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// SSE endpoint for community-specific real-time updates
// Broadcasts: community_message, member_joined, member_left, new_activity
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: communityId } = await params

  // Check for SSE support via Accept header
  const acceptHeader = request.headers.get('Accept')
  if (!acceptHeader?.includes('text/event-stream')) {
    return new Response('SSE endpoint - use EventSource to connect', {
      status: 400,
      headers: { 'Content-Type': 'text/plain' },
    })
  }

  const { stream } = createSSEStream('community', communityId)

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
}
