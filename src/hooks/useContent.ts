import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export interface ContentItem {
  id: string
  tracked_account_id: string
  content_id: string
  content_type: string
  content_url: string
  caption: string
  media_urls: string[]
  engagement_data: any
  scraped_at: string
}

// API functions
const fetchAccountContent = async (accountId: string): Promise<ContentItem[]> => {
  const response = await fetch(`/api/content/${accountId}`)
  
  if (!response.ok) {
    throw new Error('Failed to fetch content')
  }
  
  const data = await response.json()
  return data.content
}

const fetchAllContent = async (): Promise<ContentItem[]> => {
  const response = await fetch('/api/content')
  
  if (!response.ok) {
    throw new Error('Failed to fetch all content')
  }
  
  const data = await response.json()
  return data.content || []
}

const scrapeAccountContent = async (accountId: string): Promise<{ scraped_count: number; stored_count: number }> => {
  const response = await fetch('/api/scrape', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ accountId }),
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to scrape content')
  }
  
  return response.json()
}

// React Query hooks
export const useAccountContent = (accountId: string) => {
  return useQuery({
    queryKey: ['content', accountId],
    queryFn: () => fetchAccountContent(accountId),
    enabled: !!accountId,
  })
}

export const useContent = () => {
  return useQuery({
    queryKey: ['content'],
    queryFn: fetchAllContent,
  })
}

export const useScrapeContent = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: scrapeAccountContent,
    onSuccess: (_, accountId) => {
      // Invalidate content queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ['content', accountId] })
      queryClient.invalidateQueries({ queryKey: ['content'] })
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
    },
  })
} 