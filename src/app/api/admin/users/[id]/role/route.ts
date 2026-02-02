import { NextRequest, NextResponse } from 'next/server'
import { checkSuperadmin } from '@/lib/auth'
import { updateUserRole, getUser } from '@/lib/db'

/**
 * POST /api/admin/users/:id/role
 * Superadmin endpoint to set a user's role
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check superadmin authorization
    const authResult = await checkSuperadmin()
    if (!authResult.isAuthorized) {
      return NextResponse.json(
        { error: authResult.error || 'Unauthorized' },
        { status: 403 }
      )
    }

    const { id: userId } = params
    const body = await request.json()
    const { role } = body

    if (!role || !['user', 'superadmin'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be "user" or "superadmin"' },
        { status: 400 }
      )
    }

    // Verify user exists
    const user = await getUser(userId)
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Prevent removing own superadmin status
    if (userId === authResult.userId && role === 'user') {
      return NextResponse.json(
        { error: 'Cannot remove your own superadmin status' },
        { status: 400 }
      )
    }

    // Update the role
    const updatedUser = await updateUserRole(userId, role)

    return NextResponse.json({
      success: true,
      message: `User role updated to ${role}`,
      user: {
        id: updatedUser?.id,
        email: updatedUser?.email,
        name: updatedUser?.name,
        role: updatedUser?.role
      }
    })
  } catch (error) {
    console.error('Error updating user role:', error)
    return NextResponse.json(
      { error: 'Failed to update user role' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/admin/users/:id/role
 * Get a user's current role
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check superadmin authorization
    const authResult = await checkSuperadmin()
    if (!authResult.isAuthorized) {
      return NextResponse.json(
        { error: authResult.error || 'Unauthorized' },
        { status: 403 }
      )
    }

    const { id: userId } = params
    const user = await getUser(userId)

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    })
  } catch (error) {
    console.error('Error fetching user role:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user role' },
      { status: 500 }
    )
  }
}
