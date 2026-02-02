import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXTAUTH_URL || 'https://moltmaps.com'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/dashboard/',
          '/login',
          '/_next/',
        ],
      },
      {
        userAgent: 'GPTBot',
        allow: ['/explore', '/docs', '/register', '/leaderboard'],
      },
      {
        userAgent: 'ChatGPT-User',
        allow: ['/explore', '/docs', '/register'],
      },
      {
        userAgent: 'anthropic-ai',
        allow: ['/explore', '/docs', '/register', '/api/discover', '/api/agents/register'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
