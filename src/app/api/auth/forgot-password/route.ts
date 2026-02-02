import { NextRequest, NextResponse } from 'next/server'
import { getUserByEmail, createPasswordResetToken } from '@/lib/db'
import { sendPasswordResetEmail } from '@/lib/email'
import { rateLimiter, getClientIP } from '@/lib/rate-limiter'

// Rate limit: 3 reset requests per hour per IP
const RATE_LIMIT = {
  limit: 3,
  windowMs: 60 * 60 * 1000, // 1 hour
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = getClientIP(request)
    const rateLimit = rateLimiter.check(
      `forgot-password:${clientIP}`,
      RATE_LIMIT.limit,
      RATE_LIMIT.windowMs
    )

    if (!rateLimit.allowed) {
      const retryAfter = Math.ceil((rateLimit.resetAt - Date.now()) / 1000)
      return NextResponse.json(
        {
          error: 'Too many requests',
          message: 'Please wait before requesting another password reset.',
          retry_after: retryAfter,
        },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { email } = body

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Always return success even if email doesn't exist (security best practice)
    // This prevents email enumeration attacks
    const successResponse = NextResponse.json({
      success: true,
      message: 'If an account with that email exists, we have sent a password reset link.',
    })

    // Find user by email
    const user = await getUserByEmail(email.toLowerCase().trim())
    if (!user) {
      // Return success anyway to prevent enumeration
      return successResponse
    }

    // Check if user has a password (they might be OAuth-only)
    if (!user.password_hash) {
      // Return success anyway to prevent enumeration
      return successResponse
    }

    // Create reset token
    const resetToken = await createPasswordResetToken(user.id)

    // Send email
    const emailResult = await sendPasswordResetEmail(
      user.email,
      resetToken.token,
      user.name || undefined
    )

    if (!emailResult.success) {
      console.error('Failed to send password reset email:', emailResult.error)
      // Still return success to user (they don't need to know about internal errors)
    }

    return successResponse
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: 'An error occurred. Please try again later.' },
      { status: 500 }
    )
  }
}
