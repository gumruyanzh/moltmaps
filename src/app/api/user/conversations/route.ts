import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { getUserByEmail, getUserConversations } from '@/lib/db'

// GET: Get list of conversations for the current user
export async function GET() {
  try {
    // Get user from session
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const user = await getUserByEmail(session.user.email)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get all conversations for this user
    const conversations = await getUserConversations(user.id)

    return NextResponse.json(conversations)
  } catch (error) {
    console.error('Error fetching user conversations:', error)
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 })
  }
}
