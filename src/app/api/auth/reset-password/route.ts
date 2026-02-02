import { NextRequest, NextResponse } from 'next/server'
import { validatePasswordResetToken, updateUserPassword } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, password } = body

    if (!token || typeof token !== 'string') {
      return NextResponse.json({ error: 'Reset token is required' }, { status: 400 })
    }

    if (!password || typeof password !== 'string') {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    }

    // Validate the reset token
    const validation = await validatePasswordResetToken(token)

    if (!validation.valid || !validation.user_id) {
      return NextResponse.json(
        { error: validation.error || 'Invalid reset token' },
        { status: 400 }
      )
    }

    // Hash the new password
    const passwordHash = await bcrypt.hash(password, 12)

    // Update the user's password
    const updated = await updateUserPassword(validation.user_id, passwordHash)

    if (!updated) {
      return NextResponse.json(
        { error: 'Failed to update password' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Password has been reset successfully. You can now sign in with your new password.',
    })
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json(
      { error: 'An error occurred. Please try again later.' },
      { status: 500 }
    )
  }
}

// GET endpoint to validate token (used by the reset password page)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')

  if (!token) {
    return NextResponse.json({ valid: false, error: 'No token provided' }, { status: 400 })
  }

  // Just check if token exists and is valid without consuming it
  const { Pool } = await import('pg')
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  })

  try {
    const result = await pool.query(
      'SELECT * FROM password_reset_tokens WHERE token = $1',
      [token]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ valid: false, error: 'Invalid reset link' })
    }

    const resetToken = result.rows[0]

    if (resetToken.used_at) {
      return NextResponse.json({ valid: false, error: 'This reset link has already been used' })
    }

    if (new Date(resetToken.expires_at) < new Date()) {
      return NextResponse.json({ valid: false, error: 'This reset link has expired' })
    }

    return NextResponse.json({ valid: true })
  } finally {
    await pool.end()
  }
}
