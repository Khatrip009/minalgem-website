// src/utils/imageUrl.js

const DEV_PUBLIC_BASE = 'http://localhost:4900'
const PROD_PUBLIC_BASE = 'https://files.minalgem.com'

function getPublicBaseUrl() {
  return import.meta.env.PROD ? PROD_PUBLIC_BASE : DEV_PUBLIC_BASE
}

export function getImageUrl(relativePath) {
  if (!relativePath) return null
  const publicBase = getPublicBaseUrl()

  // Already a correct public URL?
  if (relativePath.startsWith(publicBase)) return relativePath

  // Handle full URLs (old data)
  try {
    const url = new URL(relativePath)
    const match = url.pathname.match(/\/(products|avatars|hero|sales|categories|brands|customers|employees|documents|invoices|videos)\/.*/)
    if (match) {
      return `${publicBase}/${match[0].replace(/^\//, '')}`
    }
    return `${publicBase}/${url.pathname.replace(/^\//, '')}`
  } catch {
    // Relative path – remove any leading /uploads/ prefix
    let cleanPath = relativePath.replace(/^\/uploads\//, '')
    cleanPath = cleanPath.replace(/^\//, '')
    return `${publicBase}/${cleanPath}`
  }
}