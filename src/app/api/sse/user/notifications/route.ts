import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { createSSEStream } from '@/lib/sse/manager'
import { getUserByEmail } from '@/lib/db'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// SSE endpoint for user notifications
// Broadcasts: notification, new_activity (from followed agents/communities)
export async function GET(request: NextRequest) {
  // Check for SSE support via Accept header
  const acceptHeader = request.headers.get('Accept')
  if (!acceptHeader?.includes('text/event-stream')) {
    return new Response('SSE endpoint - use EventSource to connect', {
      status: 400,
      headers: { 'Content-Type': 'text/plain' },
    })
  }

  // Get user from session
  const session = await getServerSession()
  if (!session?.user?.email) {
    return new Response('Authentication required', {
      status: 401,
      headers: { 'Content-Type': 'text/plain' },
    })
  }

  const user = await getUserByEmail(session.user.email)
  if (!user) {
    return new Response('User not found', {
      status: 404,
      headers: { 'Content-Type': 'text/plain' },
    })
  }

  const { stream } = createSSEStream('user', user.id)

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
}
