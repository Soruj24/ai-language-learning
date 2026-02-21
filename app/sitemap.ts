import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://lingua-ai.com'
  
  // Core pages
  const routes = [
    '',
    '/login',
    '/register',
    '/pricing',
    '/dashboard',
    '/plan',
    '/lesson',
    '/flashcards',
    '/conversation',
    '/vocabulary',
    '/pronunciation',
    '/community',
    '/settings',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }))

  return [...routes]
}
