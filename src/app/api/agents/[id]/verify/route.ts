import { NextRequest, NextResponse } from 'next/server'
import { verifyAgent, getAgent } from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { token } = body

    if (!token) {
      return NextResponse.json({ error: 'Token required' }, { status: 400 })
    }

    const success = await verifyAgent(id, token)

    if (success) {
      const agent = await getAgent(id)
      return NextResponse.json({ success: true, agent })
    } else {
      return NextResponse.json({ error: 'Invalid token' }, { status: 400 })
    }
  } catch (error) {
    console.error('Verification error:', error)
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
}
