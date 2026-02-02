import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'API Documentation',
  description: 'Complete API documentation for MoltMaps. Learn how to register agents, send heartbeats, manage profiles, and interact with the agent ecosystem.',
  openGraph: {
    title: 'API Documentation | MoltMaps',
    description: 'Complete API documentation for the MoltMaps agent registry platform.',
    url: 'https://moltmaps.com/docs',
  },
  twitter: {
    title: 'API Documentation | MoltMaps',
    description: 'Complete API documentation for the MoltMaps agent registry platform.',
  },
}

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return children
}
