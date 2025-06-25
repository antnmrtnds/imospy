'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'motion/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAccounts, useDeleteAccount, useUpdateAccount } from '@/hooks/useAccounts'
import { useAccountContent, useScrapeContent } from '@/hooks/useContent'
import { TrackedAccount } from '@/types'
import Link from 'next/link'

interface AccountPageContentProps {
  accountId: string
}

const getPlatformIcon = (platform: string) => {
  switch (platform) {
    case 'instagram':
      return <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      </div>
    case 'tiktok':
      return <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center">
        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
        </svg>
      </div>
    case 'linkedin':
      return <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      </div>
    default:
      return <div className="w-12 h-12 bg-gray-400 rounded-lg"></div>
  }
}

export default function AccountPageContent({ accountId }: AccountPageContentProps) {
  const [scrapingId, setScrapingId] = useState<string | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [selectedCarousel, setSelectedCarousel] = useState<any>(null)
  const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set())
  const [selectedVideo, setSelectedVideo] = useState<any>(null)
  
  const { data: accounts = [] } = useAccounts()
  const { data: content = [], isLoading: contentLoading, refetch: refetchContent } = useAccountContent(accountId)
  // Show newest posts first by reversing the content array
  const sortedContent = [...content].reverse()
  const scrapeContentMutation = useScrapeContent()
  const updateAccountMutation = useUpdateAccount()
  
  const shouldReduceMotion = useReducedMotion()
  // Variants for content animations
  const containerVariants = {
    hidden: {},
    visible: { transition: shouldReduceMotion ? {} : { staggerChildren: 0.05 } }
  }
  const itemVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 20 },
    visible: { opacity: 1, y: 0 }
  }

  const handleEscape = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      setSelectedCarousel(null)
      setSelectedVideo(null)
    }
  }

  useEffect(() => {
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])
  
  const account = accounts.find(acc => acc.id === accountId)

  if (!account) {
    return (
      <div className="text-center py-20">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.864-.833-2.634 0L4.098 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">Account not found</h3>
        <p className="mt-1 text-sm text-gray-500">
          This account doesn't exist or you don't have access to it.
        </p>
        <div className="mt-6">
          <Link href="/dashboard">
            <Button>Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    )
  }

  const handleScrapeContent = async () => {
    setScrapingId(account.id)
    try {
      await scrapeContentMutation.mutateAsync(account.id)
      refetchContent()
    } catch (error) {
      console.error('Failed to scrape content:', error)
    } finally {
      setScrapingId(null)
    }
  }

  const handleToggleActive = async () => {
    setTogglingId(account.id)
    try {
      await updateAccountMutation.mutateAsync({
        id: account.id,
        updateData: { is_active: !account.is_active }
      })
    } catch (error) {
      console.error('Failed to update account:', error)
    } finally {
      setTogglingId(null)
    }
  }

  // Calculate analytics
  const totalEngagement = content.reduce((sum, item) => {
    const engagement = item.engagement_data || {}
    return sum + (engagement.likes || 0) + (engagement.comments || 0) + (engagement.shares || 0)
  }, 0)

  const avgEngagement = content.length > 0 ? Math.round(totalEngagement / content.length) : 0

  // Get the latest post date from actual post timestamps, not scraped_at
  const latestPostDate = content.length > 0 
    ? content.reduce((latest, item) => {
        const timestamp = item.engagement_data?.timestamp || item.scraped_at
        const itemDate = new Date(timestamp)
        return itemDate > latest ? itemDate : latest
      }, new Date(0))
    : null

  function toggleExpand(id: string) {
    setExpandedPosts(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <>
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Account Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white rounded-lg shadow-sm p-6"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {getPlatformIcon(account.platform)}
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <h1 className="text-2xl font-bold text-gray-900">{account.account_name}</h1>
              <p className="text-gray-600">@{account.account_handle} • {account.platform}</p>
              <div className="flex items-center space-x-4 mt-2">
                <motion.span 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                  className={`px-2 py-1 text-xs rounded-full ${
                    account.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {account.is_active ? 'Active' : 'Paused'}
                </motion.span>
                <span className="text-xs text-gray-500">
                  Added {new Date(account.added_at).toLocaleDateString()}
                </span>
                {latestPostDate && (
                  <span className="text-xs text-gray-500">
                    Last posted {latestPostDate.toLocaleDateString()}
                  </span>
                )}
              </div>
            </motion.div>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="flex items-center space-x-3"
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                variant="outline"
                onClick={handleScrapeContent}
                disabled={scrapingId === account.id || !account.is_active}
              >
                {scrapingId === account.id ? 'Scraping...' : 'Scrape Content'}
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Analytics Cards */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        {[
          { title: "Total Posts", value: content.length },
          { title: "Total Engagement", value: totalEngagement.toLocaleString() },
          { title: "Avg Engagement", value: avgEngagement.toLocaleString() },
          { title: "Latest Post", value: content.length > 0 
            ? latestPostDate ? latestPostDate.toLocaleDateString() : 'No date'
            : 'None' }
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
            whileHover={{ y: -5, scale: 1.02 }}
          >
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Content Grid */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Latest Content</CardTitle>
            <CardDescription>
              Recent posts and updates from this account
            </CardDescription>
          </CardHeader>
          <CardContent>
            {contentLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin h-8 w-8 border-b-2 border-blue-600 mx-auto" />
                <span className="ml-3 text-gray-600">Loading content...</span>
              </div>
            ) : content.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="text-center py-12"
              >
                <motion.svg 
                  initial={{ y: -10 }}
                  animate={{ y: 0 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="mx-auto h-12 w-12 text-gray-400" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </motion.svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No content yet</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Click "Scrape Content" to start collecting posts from this account.
                </p>
              </motion.div>
            ) : (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {sortedContent.map(item => (
                  <motion.div
                    key={item.id}
                    variants={itemVariants}
                    whileHover={shouldReduceMotion ? {} : { scale: 1.02, y: -5 }}
                    className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                  >
                    {/* Media Preview (skipped for LinkedIn) */}
                    {account.platform !== 'linkedin' && item.media_urls && item.media_urls.length > 0 ? (
                      <motion.div 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="aspect-square bg-gray-200 flex items-center justify-center relative overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => {
                          if (item.content_type === 'video') {
                            setSelectedVideo(item)
                          } else if (item.media_urls.length > 1) {
                            setSelectedCarousel(item)
                          }
                        }}
                      >
                        {item.content_type === 'video' ? (
                          <div className="w-full h-full relative group">
                            {(() => {
                              // Platform-specific video handling
                              if (account.platform === 'tiktok') {
                                // TikTok: Use cover images as thumbnails
                                const coverUrl = item.media_urls.find((url: string) => 
                                  !url.includes('.mp4') && !url.includes('video') // Get cover, not video
                                )
                                
                                return (
                                  <div className="w-full h-full relative">
                                    {coverUrl ? (
                                      <img
                                        src={coverUrl}
                                        alt="TikTok video thumbnail"
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                          e.currentTarget.style.display = 'none'
                                          const fallback = e.currentTarget.nextElementSibling?.nextElementSibling as HTMLElement
                                          if (fallback) fallback.style.display = 'flex'
                                        }}
                                      />
                                    ) : (
                                      <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                                        <div className="text-center text-white">
                                          <div className="text-4xl mb-2">🎥</div>
                                          <div className="text-sm">TikTok Video</div>
                                        </div>
                                      </div>
                                    )}
                                    {/* TikTok play button overlay */}
                                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 group-hover:bg-opacity-30 transition-all">
                                      <div className="bg-white bg-opacity-90 rounded-full p-4 group-hover:scale-110 transition-transform">
                                        <svg className="w-8 h-8 text-gray-800" fill="currentColor" viewBox="0 0 24 24">
                                          <path d="M8 5v14l11-7z"/>
                                        </svg>
                                      </div>
                                    </div>
                                    {/* TikTok badge */}
                                    <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded-full">
                                      TikTok
                                    </div>
                                  </div>
                                )
                              } else {
                                // Instagram/other platforms: existing logic
                                const videoUrl = item.media_urls.find((url: string) => 
                                  url.includes('.mp4') || url.includes('.mov')
                                )
                                const posterUrl = item.media_urls.find((url: string) => 
                                  url.includes('.jpg') || url.includes('.jpeg') || url.includes('.png') || url.includes('scontent-')
                                )
                                
                                return (
                                  <div className="w-full h-full relative">
                                    {videoUrl && (
                                      <video
                                        src={videoUrl}
                                        poster={posterUrl && (posterUrl.includes('instagram.com') || posterUrl.includes('cdninstagram.com') || posterUrl.includes('scontent-'))
                                          ? `/api/proxy-image?url=${encodeURIComponent(posterUrl)}`
                                          : posterUrl
                                        }
                                        className="w-full h-full object-cover"
                                        muted
                                        playsInline
                                        preload="metadata"
                                      />
                                    )}
                                    {/* Play button overlay */}
                                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 group-hover:bg-opacity-30 transition-all">
                                      <div className="bg-white bg-opacity-90 rounded-full p-4 group-hover:scale-110 transition-transform">
                                        <svg className="w-8 h-8 text-gray-800" fill="currentColor" viewBox="0 0 24 24">
                                          <path d="M8 5v14l11-7z"/>
                                        </svg>
                                      </div>
                                    </div>
                                    {/* Video indicator badge */}
                                    <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded-full">
                                      🎥 Video
                                    </div>
                                  </div>
                                )
                              }
                            })()}
                            {/* Video fallback */}
                            <div className="absolute inset-0 bg-gray-100 flex items-center justify-center" style={{display: 'none'}}>
                              <div className="text-center">
                                <div className="text-4xl mb-2">🎥</div>
                                <div className="text-sm text-gray-600">Video</div>
                              </div>
                            </div>
                          </div>
                        ) : item.media_urls.length === 1 ? (
                          // Single image - platform-specific handling
                          <div className="w-full h-full relative">
                            <img
                              src={(() => {
                                const url = item.media_urls[0]
                                // Use proxy for Instagram/CDN URLs, but not for LinkedIn/TikTok
                                if ((url.includes('instagram.com') || url.includes('cdninstagram.com') || url.includes('scontent-')) && account.platform === 'instagram') {
                                  return `/api/proxy-image?url=${encodeURIComponent(url)}`
                                }
                                return url
                              })()}
                              alt="Post content"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none'
                                const fallback = e.currentTarget.nextElementSibling as HTMLElement
                                if (fallback) fallback.style.display = 'flex'
                              }}
                            />
                            {/* Platform badge for non-Instagram content */}
                            {account.platform !== 'instagram' && (
                              <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded-full capitalize">
                                {account.platform}
                              </div>
                            )}
                            {/* Image fallback */}
                            <div className="absolute inset-0 bg-gray-100 flex items-center justify-center" style={{display: 'none'}}>
                              <div className="text-center">
                                <div className="text-4xl mb-2">📷</div>
                                <div className="text-sm text-gray-600">Image</div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          // Multiple images - show in grid
                          <div className={`w-full h-full grid gap-1 ${
                            item.media_urls.length === 2 ? 'grid-cols-2' :
                            item.media_urls.length === 3 ? 'grid-cols-2 grid-rows-2' :
                            'grid-cols-2 grid-rows-2'
                          }`}>
                            {item.media_urls.slice(0, 4).map((url, idx) => (
                              <div key={idx} className={`relative overflow-hidden ${
                                item.media_urls.length === 3 && idx === 0 ? 'row-span-2' : ''
                              }`}>
                                <img
                                  src={(() => {
                                    // Use proxy for any Instagram/CDN URLs
                                    if (url.includes('instagram.com') || url.includes('cdninstagram.com') || url.includes('scontent-')) {
                                      return `/api/proxy-image?url=${encodeURIComponent(url)}`
                                    }
                                    return url
                                  })()}
                                  alt={`Carousel image ${idx + 1}`}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none'
                                    const fallback = e.currentTarget.nextElementSibling as HTMLElement
                                    if (fallback) fallback.style.display = 'flex'
                                  }}
                                />
                                {/* Individual image fallback */}
                                <div className="absolute inset-0 bg-gray-100 flex items-center justify-center" style={{display: 'none'}}>
                                  <div className="text-2xl">📷</div>
                                </div>
                                {/* Show count overlay on last image if more than 4 */}
                                {idx === 3 && item.media_urls.length > 4 && (
                                  <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center">
                                    <span className="text-black font-bold text-lg">+{item.media_urls.length - 4}</span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                        {/* Carousel indicator - only for non-video posts */}
                        {item.media_urls.length > 1 && item.content_type !== 'video' && (
                          <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded-full">
                            📷 {item.media_urls.length}
                          </div>
                        )}
                        {/* Click to view indicator - only for non-video posts */}
                        {item.media_urls.length > 1 && item.content_type !== 'video' && (
                          <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded-full">
                            Click to view all
                          </div>
                        )}
                      </motion.div>
                    ) : null}
                    
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <span className="px-2 py-1 text-xs bg-gray-100 rounded-full">
                          {item.content_type}
                        </span>
                        <span className="text-xs text-gray-500">
                          {(() => {
                            // Try to get the actual post date from engagement_data.timestamp first
                            const timestamp = item.engagement_data?.timestamp || item.scraped_at
                            if (timestamp) {
                              const date = new Date(timestamp)
                              // Check if date is valid
                              if (!isNaN(date.getTime())) {
                                return date.toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })
                              }
                            }
                            return 'No date'
                          })()}
                        </span>
                      </div>
                      
                      {item.caption && (
                        <div className="text-sm text-gray-700 mb-3">
                          {(account.platform === 'linkedin' || account.platform === 'instagram') ? (
                            <>
                              {expandedPosts.has(item.id) ? item.caption : `${item.caption.substring(0, 120)}...`}
                              {item.caption.length > 120 && (
                                <button
                                  className="text-blue-600 ml-2 text-xs"
                                  onClick={() => toggleExpand(item.id)}
                                >
                                  {expandedPosts.has(item.id) ? 'Show less' : 'Read more'}
                                </button>
                              )}
                            </>
                          ) : (
                            <p className="text-sm text-gray-700 mb-3 line-clamp-3">
                              {item.caption.length > 120 
                                ? `${item.caption.substring(0, 120)}...`
                                : item.caption
                              }
                            </p>
                          )}
                        </div>
                      )}
                      
                      {item.engagement_data && (
                        <div className="flex flex-wrap gap-3 text-xs text-gray-600 mb-3">
                          {/* Platform-specific engagement metrics */}
                          {account.platform === 'tiktok' ? (
                            <>
                              {item.engagement_data.plays !== undefined && item.engagement_data.plays !== null && (
                                <span className="flex items-center gap-1">
                                  <span className="text-purple-500">▶️</span> 
                                  {typeof item.engagement_data.plays === 'number' ? item.engagement_data.plays.toLocaleString() : item.engagement_data.plays}
                                </span>
                              )}
                              {item.engagement_data.likes !== undefined && item.engagement_data.likes !== null && (
                                <span className="flex items-center gap-1">
                                  <span className="text-red-500">❤️</span> 
                                  {typeof item.engagement_data.likes === 'number' ? item.engagement_data.likes.toLocaleString() : item.engagement_data.likes}
                                </span>
                              )}
                              {item.engagement_data.comments !== undefined && item.engagement_data.comments !== null && (
                                <span className="flex items-center gap-1">
                                  <span className="text-blue-500">💬</span> 
                                  {typeof item.engagement_data.comments === 'number' ? item.engagement_data.comments.toLocaleString() : item.engagement_data.comments}
                                </span>
                              )}
                              {item.engagement_data.shares !== undefined && item.engagement_data.shares !== null && (
                                <span className="flex items-center gap-1">
                                  <span className="text-green-500">🔄</span> 
                                  {typeof item.engagement_data.shares === 'number' ? item.engagement_data.shares.toLocaleString() : item.engagement_data.shares}
                                </span>
                              )}
                            </>
                          ) : account.platform === 'linkedin' ? (
                            <div className="flex items-center gap-3 text-xs text-gray-600 mb-3">
                              <span className="flex items-center gap-1">
                                <span className="text-blue-600">👍</span> 
                                {item.engagement_data.likes !== undefined && item.engagement_data.likes !== null ? item.engagement_data.likes.toLocaleString() : '0'}
                                {item.engagement_data._estimated && (
                                  <span className="text-xs text-orange-500" title="Estimated based on comment count">~</span>
                                )}
                              </span>
                              <span className="flex items-center gap-1">
                                <span className="text-blue-500">💬</span> {item.engagement_data.comments !== undefined && item.engagement_data.comments !== null ? item.engagement_data.comments.toLocaleString() : '0'}
                              </span>
                              <span className="flex items-center gap-1">
                                <span className="text-green-500">🔁</span> {item.engagement_data.reposts !== undefined && item.engagement_data.reposts !== null ? item.engagement_data.reposts.toLocaleString() : '0'}
                              </span>
                              {/* Debug info for LinkedIn engagement */}
                              {process.env.NODE_ENV === 'development' && (
                                <span className="text-xs text-gray-400">
                                  [Debug: enriched={item.engagement_data._enriched ? 'yes' : 'no'}
                                  {item.engagement_data._estimated ? ', estimated' : ''}]
                                </span>
                              )}
                          </div>
                          ) : (
                            // Instagram and other platforms
                            <>
                              {item.engagement_data.likes !== undefined && item.engagement_data.likes !== null && (
                                <span className="flex items-center gap-1">
                                  <span className="text-red-500">❤️</span> 
                                  {typeof item.engagement_data.likes === 'number' ? item.engagement_data.likes.toLocaleString() : item.engagement_data.likes}
                                </span>
                              )}
                              {item.engagement_data.comments !== undefined && item.engagement_data.comments !== null && (
                                <span className="flex items-center gap-1">
                                  <span className="text-blue-500">💬</span> 
                                  {typeof item.engagement_data.comments === 'number' ? item.engagement_data.comments.toLocaleString() : item.engagement_data.comments}
                                </span>
                              )}
                              {item.engagement_data.shares !== undefined && item.engagement_data.shares !== null && (
                                <span className="flex items-center gap-1">
                                  <span className="text-green-500">🔄</span> 
                                  {typeof item.engagement_data.shares === 'number' ? item.engagement_data.shares.toLocaleString() : item.engagement_data.shares}
                                </span>
                              )}
                            </>
                          )}
                        </div>
                      )}
                      
                      {item.content_url && (
                        <a
                          href={item.content_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline"
                        >
                          View Original →
                        </a>
                      )}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>

    {/* Carousel Modal */}
    <AnimatePresence>
      {selectedCarousel && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 bg-transparent flex items-center justify-center z-50 p-4 backdrop-blur-sm"
          onClick={() => setSelectedCarousel(null)}
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 30 
            }}
            className="bg-white rounded-xl shadow-2xl max-w-6xl max-h-[90vh] overflow-hidden border"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-6 border-b">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {selectedCarousel.content_type === 'carousel' ? 'Carousel' : 'Post'} Media 
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedCarousel.media_urls.length} {selectedCarousel.media_urls.length === 1 ? 'item' : 'items'}
                </p>
              </div>
              <motion.button 
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setSelectedCarousel(null)}
                className="text-gray-500 hover:text-gray-700 text-xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              >
                ×
              </motion.button>
            </div>
            
            <div className="p-6 max-h-[70vh] overflow-y-auto bg-white">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {selectedCarousel.media_urls.map((url: string, idx: number) => (
                  <div key={idx} className="relative group">
                    <div className="bg-gray-100 rounded-lg overflow-hidden shadow-sm">
                      {url.includes('.mp4') || url.includes('video') || url.includes('.mov') ? (
                        // Render video element
                        <video
                          src={url}
                          className="w-full h-auto rounded-lg"
                          controls
                          preload="metadata"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                            const fallback = e.currentTarget.nextElementSibling as HTMLElement
                            if (fallback) fallback.style.display = 'flex'
                          }}
                        />
                      ) : (
                        // Render image element
                        <img
                          src={(() => {
                            // Use proxy for any Instagram/CDN URLs
                            if (url.includes('instagram.com') || url.includes('cdninstagram.com') || url.includes('scontent-')) {
                              return `/api/proxy-image?url=${encodeURIComponent(url)}`
                            }
                            return url
                          })()}
                          alt={`Media ${idx + 1}`}
                          className="w-full h-auto rounded-lg transition-transform group-hover:scale-105"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                            const fallback = e.currentTarget.nextElementSibling as HTMLElement
                            if (fallback) fallback.style.display = 'flex'
                          }}
                        />
                      )}
                      <div 
                        className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center" 
                        style={{display: 'none'}}
                      >
                        <div className="text-center">
                          <div className="text-4xl mb-2">
                            {url.includes('.mp4') || url.includes('video') || url.includes('.mov') ? '🎥' : '📷'}
                          </div>
                          <div className="text-sm text-gray-600">
                            {url.includes('.mp4') || url.includes('video') || url.includes('.mov') ? 'Video' : 'Image'} {idx + 1}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>

    {/* Video Modal */}
    <AnimatePresence>
      {selectedVideo && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedVideo(null)}
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 30 
            }}
            className="bg-black rounded-xl shadow-2xl max-w-4xl max-h-[90vh] overflow-hidden border relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-4 right-4 z-10">
              <motion.button 
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setSelectedVideo(null)}
                className="text-white hover:text-gray-300 bg-black bg-opacity-50 rounded-full p-2 transition-colors text-xl font-bold w-10 h-10 flex items-center justify-center"
              >
                ×
              </motion.button>
            </div>
            
            <div className="p-4">
              {(() => {
                const videoUrl = selectedVideo.media_urls.find((url: string) => 
                  url.includes('.mp4') || url.includes('video') || url.includes('.mov')
                )
                
                if (videoUrl) {
                  return (
                    <video
                      src={videoUrl}
                      className="w-full max-h-[80vh] rounded-lg"
                      controls
                      autoPlay
                      preload="metadata"
                      onError={(e) => {
                        console.error('Video failed to load:', videoUrl)
                        e.currentTarget.style.display = 'none'
                        const fallback = e.currentTarget.nextElementSibling as HTMLElement
                        if (fallback) fallback.style.display = 'flex'
                      }}
                    />
                  )
                } else {
                  return (
                    <div className="w-full h-96 bg-gray-800 rounded-lg flex items-center justify-center">
                      <div className="text-center text-white">
                        <div className="text-6xl mb-4">🎥</div>
                        <div className="text-lg mb-2">Video not available</div>
                        <div className="text-sm text-gray-400">The video URL could not be found</div>
                      </div>
                    </div>
                  )
                }
              })()}
              
              {/* Video fallback */}
              <div 
                className="w-full h-96 bg-gray-800 rounded-lg flex items-center justify-center" 
                style={{display: 'none'}}
              >
                <div className="text-center text-white">
                  <div className="text-6xl mb-4">⚠️</div>
                  <div className="text-lg mb-2">Video failed to load</div>
                  <div className="text-sm text-gray-400">There was an error loading this video</div>
                  {selectedVideo.content_url && (
                    <a
                      href={selectedVideo.content_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 text-sm mt-2 inline-block"
                    >
                      View on {selectedVideo.platform} →
                    </a>
                  )}
                </div>
              </div>
              
              {/* Video info */}
              <div className="mt-4 text-white">
                <div className="flex justify-between items-start mb-2">
                  <span className="px-2 py-1 text-xs bg-gray-700 rounded-full">
                    {selectedVideo.content_type}
                  </span>
                  <span className="text-xs text-gray-300">
                    {(() => {
                      const timestamp = selectedVideo.engagement_data?.timestamp || selectedVideo.scraped_at
                      if (timestamp) {
                        const date = new Date(timestamp)
                        if (!isNaN(date.getTime())) {
                          return date.toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })
                        }
                      }
                      return 'Unknown date'
                    })()}
                  </span>
                </div>
                
                {selectedVideo.caption && (
                  <p className="text-sm text-gray-200 mb-3 line-clamp-3">
                    {selectedVideo.caption}
                  </p>
                )}
                
                {selectedVideo.engagement_data && (
                  <div className="flex space-x-4 text-xs text-gray-300 mb-3">
                    {selectedVideo.engagement_data.likes !== undefined && selectedVideo.engagement_data.likes !== null && (
                      <span>❤️ {typeof selectedVideo.engagement_data.likes === 'number' ? selectedVideo.engagement_data.likes.toLocaleString() : selectedVideo.engagement_data.likes}</span>
                    )}
                    {selectedVideo.engagement_data.comments !== undefined && selectedVideo.engagement_data.comments !== null && (
                      <span>💬 {typeof selectedVideo.engagement_data.comments === 'number' ? selectedVideo.engagement_data.comments.toLocaleString() : selectedVideo.engagement_data.comments}</span>
                    )}
                    {selectedVideo.engagement_data.plays !== undefined && selectedVideo.engagement_data.plays !== null && (
                      <span>▶️ {typeof selectedVideo.engagement_data.plays === 'number' ? selectedVideo.engagement_data.plays.toLocaleString() : selectedVideo.engagement_data.plays}</span>
                    )}
                  </div>
                )}
                
                {selectedVideo.content_url && (
                  <a
                    href={selectedVideo.content_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-400 hover:text-blue-300"
                  >
                    View Original →
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  </>
  )
} 