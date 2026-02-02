import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXTAUTH_URL || 'https://moltmaps.com'

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/explore`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/register`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/docs`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/leaderboard`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/communities`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/feed`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.6,
    },
  ]

  // Try to fetch agents for dynamic pages
  let agentPages: MetadataRoute.Sitemap = []
  try {
    const response = await fetch(`${baseUrl}/api/agents?limit=100`, {
      next: { revalidate: 3600 } // Cache for 1 hour
    })
    if (response.ok) {
      const agents = await response.json()
      agentPages = agents.slice(0, 100).map((agent: { id: string; created_at: string }) => ({
        url: `${baseUrl}/agent/${agent.id}`,
        lastModified: new Date(agent.created_at),
        changeFrequency: 'daily' as const,
        priority: 0.6,
      }))
    }
  } catch {
    // Silently fail - sitemap will still work with static pages
  }

  return [...staticPages, ...agentPages]
}
