'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAccounts } from '@/hooks/useAccounts'
import { useContent } from '@/hooks/useContent'
import Link from 'next/link'

interface AnalyticsDashboardProps {
  className?: string
}

const getPlatformIcon = (platform: string) => {
  switch (platform) {
    case 'instagram':
      return <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      </div>
    case 'tiktok':
      return <div className="w-6 h-6 bg-black rounded-lg flex items-center justify-center">
        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
        </svg>
      </div>
    case 'linkedin':
      return <div className="w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center">
        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      </div>
    default:
      return <div className="w-6 h-6 bg-gray-400 rounded-lg"></div>
  }
}

export default function AnalyticsDashboard({ className }: AnalyticsDashboardProps) {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d')
  const { data: accounts = [] } = useAccounts()
  const { data: allContent = [] } = useContent()

  // Calculate analytics based on all content
  const analytics = useMemo(() => {
    const now = new Date()
    const daysAgo = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90
    const cutoffDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000)
    
    // Filter content by time range
    const filteredContent = allContent.filter(item => 
      new Date(item.scraped_at) >= cutoffDate
    )

    // Calculate total engagement
    const totalEngagement = filteredContent.reduce((sum, item) => {
      const engagement = item.engagement_data || {}
      return sum + (engagement.likes || 0) + (engagement.comments || 0) + (engagement.shares || 0)
    }, 0)

    // Calculate engagement by platform
    const platformEngagement = filteredContent.reduce((acc, item) => {
      const account = accounts.find(a => a.id === item.tracked_account_id)
      if (!account) return acc
      
      const platform = account.platform
      const engagement = item.engagement_data || {}
      const totalEng = (engagement.likes || 0) + (engagement.comments || 0) + (engagement.shares || 0)
      
      acc[platform] = (acc[platform] || 0) + totalEng
      return acc
    }, {} as Record<string, number>)

    // Get top performing content
    const topContent = filteredContent
      .map(item => {
        const account = accounts.find(a => a.id === item.tracked_account_id)
        const engagement = item.engagement_data || {}
        const totalEng = (engagement.likes || 0) + (engagement.comments || 0) + (engagement.shares || 0)
        
        return {
          ...item,
          account,
          totalEngagement: totalEng
        }
      })
      .sort((a, b) => b.totalEngagement - a.totalEngagement)
      .slice(0, 5)

    // Calculate account performance
    const accountPerformance = accounts.map(account => {
      const accountContent = filteredContent.filter(item => item.tracked_account_id === account.id)
      const totalEng = accountContent.reduce((sum, item) => {
        const engagement = item.engagement_data || {}
        return sum + (engagement.likes || 0) + (engagement.comments || 0) + (engagement.shares || 0)
      }, 0)
      
      return {
        ...account,
        postCount: accountContent.length,
        totalEngagement: totalEng,
        avgEngagement: accountContent.length > 0 ? Math.round(totalEng / accountContent.length) : 0
      }
    }).sort((a, b) => b.totalEngagement - a.totalEngagement)

    return {
      totalPosts: filteredContent.length,
      totalEngagement,
      avgEngagement: filteredContent.length > 0 ? Math.round(totalEngagement / filteredContent.length) : 0,
      platformEngagement,
      topContent,
      accountPerformance
    }
  }, [allContent, accounts, timeRange])

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Time Range Selector */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Analytics Overview</h2>
        <div className="flex space-x-2">
          {[
            { key: '7d', label: '7 Days' },
            { key: '30d', label: '30 Days' },
            { key: '90d', label: '90 Days' }
          ].map(({ key, label }) => (
            <Button
              key={key}
              variant={timeRange === key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange(key as '7d' | '30d' | '90d')}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Posts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalPosts}</div>
            <p className="text-xs text-gray-500 mt-1">
              Last {timeRange === '7d' ? '7' : timeRange === '30d' ? '30' : '90'} days
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Engagement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalEngagement.toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">
              Likes, comments & shares
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Avg Engagement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.avgEngagement.toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">
              Per post
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Accounts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{accounts.filter(a => a.is_active).length}</div>
            <p className="text-xs text-gray-500 mt-1">
              Out of {accounts.length} total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Platform Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Performance</CardTitle>
          <CardDescription>
            Engagement breakdown by social media platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(analytics.platformEngagement).map(([platform, engagement]) => (
              <div key={platform} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getPlatformIcon(platform)}
                  <div>
                    <span className="font-medium capitalize">{platform}</span>
                    <p className="text-sm text-gray-500">
                      {accounts.filter(a => a.platform === platform && a.is_active).length} active accounts
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{engagement.toLocaleString()}</div>
                  <div className="text-sm text-gray-500">engagement</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Performing Content */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Content</CardTitle>
          <CardDescription>
            Posts with the highest engagement in the selected period
          </CardDescription>
        </CardHeader>
        <CardContent>
          {analytics.topContent.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No content data</h3>
              <p className="mt-1 text-sm text-gray-500">
                Start scraping content from your tracked accounts to see analytics.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {analytics.topContent.map((item, index) => (
                <div key={item.id} className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex-shrink-0">
                    <span className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full">
                      {index + 1}
                    </span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      {item.account && getPlatformIcon(item.account.platform)}
                      <span className="font-medium text-sm">
                        {item.account?.account_name || 'Unknown Account'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(item.scraped_at).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-700 mb-2 line-clamp-2">
                      {item.caption?.substring(0, 120)}
                      {item.caption && item.caption.length > 120 && '...'}
                    </p>
                    
                    <div className="flex items-center space-x-4 text-xs text-gray-600">
                      {item.engagement_data?.likes && (
                        <span>❤️ {item.engagement_data.likes.toLocaleString()}</span>
                      )}
                      {item.engagement_data?.comments && (
                        <span>💬 {item.engagement_data.comments.toLocaleString()}</span>
                      )}
                      {item.engagement_data?.shares && (
                        <span>🔄 {item.engagement_data.shares.toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex-shrink-0 text-right">
                    <div className="font-semibold text-lg">{item.totalEngagement.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">total engagement</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Account Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Account Performance</CardTitle>
          <CardDescription>
            Engagement metrics for each tracked account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.accountPerformance.map((account) => (
              <div key={account.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-4">
                  {getPlatformIcon(account.platform)}
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold">{account.account_name}</h4>
                      {!account.is_active && (
                        <span className="px-2 py-1 text-xs bg-gray-200 text-gray-600 rounded-full">
                          Paused
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">@{account.account_handle}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-6 text-sm">
                  <div className="text-center">
                    <div className="font-semibold">{account.postCount}</div>
                    <div className="text-gray-500">posts</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold">{account.totalEngagement.toLocaleString()}</div>
                    <div className="text-gray-500">total</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold">{account.avgEngagement.toLocaleString()}</div>
                    <div className="text-gray-500">avg</div>
                  </div>
                  <Link href={`/account/${account.id}`}>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 