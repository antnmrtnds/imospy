'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAccountContent } from '@/hooks/useContent'
import { TrackedAccount } from '@/types'

interface ContentPreviewProps {
  account: TrackedAccount
}

export default function ContentPreview({ account }: ContentPreviewProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const { data: content = [], isLoading, error } = useAccountContent(account.id)

  if (!isExpanded) {
    return (
      <Card className="mt-4">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-sm">Latest Content</CardTitle>
              <CardDescription>
                {content.length} items scraped
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(true)}
            >
              View Content
            </Button>
          </div>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Content from @{account.account_handle}</CardTitle>
            <CardDescription>
              Latest content from {account.platform}
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(false)}
          >
            Collapse
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading content...</span>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-600">
            Error loading content: {error instanceof Error ? error.message : 'Unknown error'}
          </div>
        ) : content.length === 0 ? (
          <div className="text-center py-8 text-gray-600">
            No content scraped yet. Click "Scrape Content" to get started.
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {content.slice(0, 5).map((item) => (
              <div key={item.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start mb-2">
                  <span className="px-2 py-1 text-xs bg-gray-100 rounded-full">
                    {item.content_type}
                  </span>
                  <span className="text-xs text-gray-500">
                    {(() => {
                      // Try to get date from engagement_data.timestamp first, then fall back to scraped_at
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
                      return 'Unknown date'
                    })()}
                  </span>
                </div>
                
                {item.caption && (
                  <p className="text-sm text-gray-700 mb-2 line-clamp-2">
                    {item.caption.length > 100 
                      ? `${item.caption.substring(0, 100)}...`
                      : item.caption
                    }
                  </p>
                )}
                
                {item.media_urls && item.media_urls.length > 0 && (
                  <div className="flex space-x-2 mb-2 overflow-x-auto">
                    {item.media_urls.slice(0, 4).map((url, idx) => (
                      <div key={idx} className="flex-shrink-0 relative">
                        {item.content_type === 'video' || url.includes('.mp4') || url.includes('video') ? (
                          <div className="w-16 h-16 bg-gray-800 rounded flex items-center justify-center">
                            <div className="text-center">
                              <div className="text-2xl">🎥</div>
                              <div className="text-xs text-white">Video</div>
                            </div>
                          </div>
                        ) : (
                          <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center relative overflow-hidden">
                            <img
                              src={url.includes('instagram.com') || url.includes('cdninstagram.com') || url.includes('scontent-')
                                ? `/api/proxy-image?url=${encodeURIComponent(url)}`
                                : url
                              }
                              alt={`Content ${idx + 1}`}
                              className="w-full h-full object-cover"
                              onLoad={(e) => {
                                // Image loaded successfully, hide fallback
                                const fallback = e.currentTarget.nextElementSibling as HTMLElement
                                if (fallback) fallback.style.display = 'none'
                              }}
                              onError={(e) => {
                                // Hide the image and show fallback
                                e.currentTarget.style.display = 'none'
                                const fallback = e.currentTarget.nextElementSibling as HTMLElement
                                if (fallback) fallback.style.display = 'flex'
                              }}
                            />
                            <div className="absolute inset-0 flex items-center justify-center text-center">
                              <div>
                                <div className="text-2xl">📷</div>
                                <div className="text-xs text-gray-500">Image</div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    {item.media_urls.length > 4 && (
                      <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                        <span className="text-xs text-gray-500">
                          +{item.media_urls.length - 4}
                        </span>
                      </div>
                    )}
                  </div>
                )}
                
                {item.engagement_data && (
                  <div className="flex space-x-4 text-xs text-gray-600">
                    {item.engagement_data.likes !== undefined && item.engagement_data.likes !== null && (
                      <span>❤️ {typeof item.engagement_data.likes === 'number' ? item.engagement_data.likes.toLocaleString() : item.engagement_data.likes}</span>
                    )}
                    {item.engagement_data.comments !== undefined && item.engagement_data.comments !== null && (
                      <span>💬 {typeof item.engagement_data.comments === 'number' ? item.engagement_data.comments.toLocaleString() : item.engagement_data.comments}</span>
                    )}
                    {item.engagement_data.shares !== undefined && item.engagement_data.shares !== null && (
                      <span>🔄 {typeof item.engagement_data.shares === 'number' ? item.engagement_data.shares.toLocaleString() : item.engagement_data.shares}</span>
                    )}
                    {item.engagement_data.plays !== undefined && item.engagement_data.plays !== null && (
                      <span>▶️ {typeof item.engagement_data.plays === 'number' ? item.engagement_data.plays.toLocaleString() : item.engagement_data.plays}</span>
                    )}
                  </div>
                )}
                
                {item.content_url && (
                  <a
                    href={item.content_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline mt-2 inline-block"
                  >
                    View Original →
                  </a>
                )}
              </div>
            ))}
            
            {content.length > 5 && (
              <div className="text-center py-4 text-gray-600 text-sm">
                Showing 5 of {content.length} items
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
} 