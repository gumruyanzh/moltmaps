import { NextAuthOptions, getServerSession } from 'next-auth'
import GithubProvider from 'next-auth/providers/github'
import CredentialsProvider from 'next-auth/providers/credentials'
import { getUserByEmail, createUser } from './db'
import { v4 as uuidv4 } from 'uuid'

interface SessionUser {
  id: string
  email?: string
  name?: string | null
  image?: string | null
}

export const authOptions: NextAuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID || '',
      clientSecret: process.env.GITHUB_SECRET || '',
    }),
    // Development/Demo provider for easy testing
    CredentialsProvider({
      name: 'Demo',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'demo@moltmaps.com' },
        name: { label: 'Name', type: 'text', placeholder: 'Demo User' },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null

        // Check if user exists
        let dbUser = await getUserByEmail(credentials.email)
        if (!dbUser) {
          // Create new user for demo
          dbUser = await createUser({
            id: uuidv4(),
            email: credentials.email,
            name: credentials.name || 'Demo User',
            image: null,
          })
        }

        return {
          id: dbUser.id,
          email: dbUser.email,
          name: dbUser.name,
          image: dbUser.image,
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (!user.email) return false

      // For OAuth providers, create/get user
      if (account?.provider === 'github') {
        let dbUser = await getUserByEmail(user.email)
        if (!dbUser) {
          dbUser = await createUser({
            id: uuidv4(),
            email: user.email,
            name: user.name || null,
            image: user.image || null,
          })
        }
      }
      return true
    },
    async session({ session }) {
      if (session.user?.email) {
        const dbUser = await getUserByEmail(session.user.email)
        if (dbUser) {
          (session.user as SessionUser).id = dbUser.id
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
