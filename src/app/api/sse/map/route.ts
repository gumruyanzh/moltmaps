import { NextRequest } from 'next/server'
import { createSSEStream } from '@/lib/sse/manager'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// SSE endpoint for real-time map updates
// Broadcasts: agent_moved, agent_status_changed, agent_profile_changed, agent_created, agent_deleted
export async function GET(request: NextRequest) {
  // Check for SSE support via Accept header
  const acceptHeader = request.headers.get('Accept')
  if (!acceptHeader?.includes('text/event-stream')) {
    return new Response('SSE endpoint - use EventSource to connect', {
      status: 400,
      headers: { 'Content-Type': 'text/plain' },
    })
  }

  const { stream } = createSSEStream('map')

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable nginx buffering
    },
  })
}
