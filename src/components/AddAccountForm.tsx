'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useCreateAccount } from '@/hooks/useAccounts'
import { CreateAccountData } from '@/types'

const formSchema = z.object({
  platform: z.enum(['instagram', 'tiktok', 'linkedin'], {
    required_error: 'Please select a platform',
  }),
  account_handle: z.string()
    .min(1, 'Account handle is required')
    .regex(/^[a-zA-Z0-9._-]+$/, 'Invalid handle format'),
  account_name: z.string().optional(),
  account_url: z.string().url('Invalid URL').optional().or(z.literal('')),
})

interface AddAccountFormProps {
  onSuccess?: () => void
  accountCount: number
}

export default function AddAccountForm({ onSuccess, accountCount }: AddAccountFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const createAccountMutation = useCreateAccount()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      platform: undefined,
      account_handle: '',
      account_name: '',
      account_url: '',
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (accountCount >= 5) {
      form.setError('root', { message: 'Maximum of 5 accounts allowed' })
      return
    }

    setIsSubmitting(true)
    
    try {
      const data: CreateAccountData = {
        platform: values.platform,
        account_handle: values.account_handle,
        account_name: values.account_name || values.account_handle,
        account_url: values.account_url || undefined,
      }

      await createAccountMutation.mutateAsync(data)
      form.reset()
      onSuccess?.()
    } catch (error) {
      form.setError('root', { 
        message: error instanceof Error ? error.message : 'Failed to add account' 
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getPlatformPlaceholder = (platform: string) => {
    switch (platform) {
      case 'instagram':
        return 'e.g., username'
      case 'tiktok':
        return 'e.g., @username'
      case 'linkedin':
        return 'e.g., company or person'
      default:
        return 'Account handle'
    }
  }

  const selectedPlatform = form.watch('platform')

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>Add New Account</span>
        </CardTitle>
        <CardDescription>
          Track a Portuguese real estate account ({accountCount}/5 accounts used)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="platform"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Platform</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a platform" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="instagram">
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-sm"></div>
                          <span>Instagram</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="tiktok">
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 bg-black rounded-sm"></div>
                          <span>TikTok</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="linkedin">
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 bg-blue-600 rounded-sm"></div>
                          <span>LinkedIn</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="account_handle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Handle</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={selectedPlatform ? getPlatformPlaceholder(selectedPlatform) : 'Account handle'}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="account_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display Name (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Friendly name for this account"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="account_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profile URL (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      placeholder="https://..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.formState.errors.root && (
              <div className="text-sm text-red-500 mt-2">
                {form.formState.errors.root.message}
              </div>
            )}

            <Button 
              type="submit" 
              disabled={isSubmitting || accountCount >= 5}
              className="w-full"
            >
              {isSubmitting ? 'Adding Account...' : 'Add Account'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
} 