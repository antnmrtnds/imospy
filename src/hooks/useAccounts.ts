import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { TrackedAccount, CreateAccountData, UpdateAccountData } from '@/types'

// API functions
const fetchAccounts = async (): Promise<TrackedAccount[]> => {
  const response = await fetch('/api/accounts')
  
  if (!response.ok) {
    throw new Error('Failed to fetch accounts')
  }
  
  const data = await response.json()
  return data.accounts
}

const createAccount = async (accountData: CreateAccountData): Promise<TrackedAccount> => {
  const response = await fetch('/api/accounts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(accountData),
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to create account')
  }
  
  const data = await response.json()
  return data.account
}

const updateAccount = async (id: string, updateData: UpdateAccountData): Promise<TrackedAccount> => {
  const response = await fetch(`/api/accounts/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updateData),
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to update account')
  }
  
  const data = await response.json()
  return data.account
}

const deleteAccount = async (id: string): Promise<void> => {
  const response = await fetch(`/api/accounts/${id}`, {
    method: 'DELETE',
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to delete account')
  }
}

// React Query hooks
export const useAccounts = () => {
  return useQuery({
    queryKey: ['accounts'],
    queryFn: fetchAccounts,
  })
}

export const useCreateAccount = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: createAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
    },
  })
}

export const useUpdateAccount = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, updateData }: { id: string; updateData: UpdateAccountData }) =>
      updateAccount(id, updateData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
    },
  })
}

export const useDeleteAccount = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: deleteAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
    },
  })
} 