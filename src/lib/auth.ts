import { NextAuthOptions, getServerSession } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { getUserByEmail, updateUserRole } from './db'
import bcrypt from 'bcryptjs'

interface SessionUser {
  id: string
  email?: string
  name?: string | null
  image?: string | null
  role?: 'user' | 'superadmin'
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Email',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'you@example.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required')
        }

        // Find user by email
        const user = await getUserByEmail(credentials.email.toLowerCase().trim())
        if (!user) {
          throw new Error('Invalid email or password')
        }

        // Check if user has a password set
        if (!user.password_hash) {
          throw new Error('Please sign up first or reset your password')
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(credentials.password, user.password_hash)
        if (!isValidPassword) {
          throw new Error('Invalid email or password')
        }

        // Auto-promote superadmins based on environment variable
        const superadminEmails = process.env.SUPERADMIN_EMAILS?.split(',').map(e => e.trim().toLowerCase()) || []
        if (superadminEmails.includes(user.email.toLowerCase()) && user.role !== 'superadmin') {
          await updateUserRole(user.id, 'superadmin')
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        }
      },
    }),
  ],
  callbacks: {
    async session({ session }) {
      if (session.user?.email) {
        const dbUser = await getUserByEmail(session.user.email)
        if (dbUser) {
          const userId = dbUser.id
          const userRole = dbUser.role || 'user'
          ;(session.user as SessionUser).id = userId
          ;(session.user as SessionUser).role = userRole as 'user' | 'superadmin'
        }
      }
      return session
    },
    async jwt({ token, user }) {
      if (user?.email) {
        const dbUser = await getUserByEmail(user.email)
        if (dbUser) {
          token.userId = dbUser.id
        }
      }
      return token
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
}

export async function getSession() {
  return await getServerSession(authOptions)
}

/**
 * Check if the current session user is a superadmin
 */
export async function checkSuperadmin(): Promise<{
  isAuthorized: boolean
  userId?: string
  error?: string
}> {
  const session = await getSession()
  if (!session?.user?.email) {
    return { isAuthorized: false, error: 'Not authenticated' }
  }

  const dbUser = await getUserByEmail(session.user.email)
  if (!dbUser) {
    return { isAuthorized: false, error: 'User not found' }
  }

  if (dbUser.role !== 'superadmin') {
    return { isAuthorized: false, userId: dbUser.id, error: 'Not a superadmin' }
  }

  return { isAuthorized: true, userId: dbUser.id }
}
