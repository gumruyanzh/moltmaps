import { NextRequest, NextResponse } from 'next/server'
import { getUserByEmail, createUser } from '@/lib/db'
import { sendWelcomeEmail } from '@/lib/email'
import { v4 as uuidv4 } from 'uuid'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name } = body

    // Validate required fields
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    if (!password || typeof password !== 'string') {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await getUserByEmail(email.toLowerCase().trim())
    if (existingUser) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 })
    }

    // Hash the password
    const saltRounds = 12
    const passwordHash = await bcrypt.hash(password, saltRounds)

    // Create the user
    const userId = uuidv4()
    const user = await createUser({
      id: userId,
      email: email.toLowerCase().trim(),
      name: name?.trim() || null,
      image: null,
      password_hash: passwordHash,
    })

    // Check if this user should be superadmin
    const superadminEmails = process.env.SUPERADMIN_EMAILS?.split(',').map(e => e.trim().toLowerCase()) || []
    if (superadminEmails.includes(email.toLowerCase().trim())) {
      // Import updateUserRole to promote user
      const { updateUserRole } = await import('@/lib/db')
      await updateUserRole(userId, 'superadmin')
    }

    // Send welcome email (async, don't wait for it)
    sendWelcomeEmail(user.email, user.name || undefined).catch(err => {
      console.error('Failed to send welcome email:', err)
    })

    return NextResponse.json({
      success: true,
      message: 'Account created successfully. You can now sign in.',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json({
      error: 'Failed to create account',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
