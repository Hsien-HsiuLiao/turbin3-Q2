'use client'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { PublicKey } from '@solana/web3.js'

// Admin wallet address
const ADMIN_WALLET = 'Coop1aAuEqbN3Pm9TzohXvS3kM4zpp3pJZ9D4M2uWXH2'

// Hook to check if current wallet is admin
export function useAdminWallet() {
  const { publicKey } = useWallet()
  const isAdmin = publicKey?.toString() === ADMIN_WALLET
  
  return {
    isAdmin,
    adminWallet: ADMIN_WALLET,
    currentWallet: publicKey?.toString()
  }
}

// Hook to get admin permissions
export function useAdminPermissions() {
  const { isAdmin } = useAdminWallet()
  
  return {
    canManageFeeds: isAdmin,
    canSystemHealthCheck: isAdmin,
    canEmergencyPause: isAdmin,
    canViewAdminDashboard: isAdmin
  }
}

// Hook to get system status
export function useSystemStatus() {
  const { connection } = useConnection()
  
  return useQuery({
    queryKey: ['system-status'],
    queryFn: async () => {
      // TODO: Implement actual system status check
      return {
        status: 'operational',
        lastCheck: new Date().toISOString(),
        feeds: {
          total: 1,
          active: 0,
          inactive: 1
        },
        listings: {
          total: 0,
          active: 0,
          reserved: 0
        }
      }
    },
    refetchInterval: 30000 // Refetch every 30 seconds
  })
}

// Hook to get feed management data
export function useFeedManagement() {
  const { connection } = useConnection()
  
  return useQuery({
    queryKey: ['feed-management'],
    queryFn: async () => {
      // TODO: Implement actual feed management data fetching
      return {
        feeds: [
          {
            address: '9jfL52Gmudwee1RK8yuNguoZET7DMDqKSR6DePBJNXot',
            status: 'inactive',
            lastUpdate: '1970-01-01T00:00:00.000Z',
            description: 'Current parking sensor feed'
          }
        ],
        availableFeeds: [
          {
            name: 'SOL/USD',
            address: 'GvDMxPzN1sCj7L26YDK2HnMRXEQmQ2aemov8YKtSyY2Ro',
            status: 'active'
          },
          {
            name: 'BTC/USD',
            address: '8SXvChNYFhRq4E9zJNs1Y8qKvZbJm5tQKvZbJm5tQKvZb',
            status: 'active'
          }
        ]
      }
    }
  })
}

// Hook to add new feed
export function useAddFeed() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ feedAddress, description }: { feedAddress: string, description: string }) => {
      // TODO: Implement actual feed addition logic
      console.log('Adding feed:', feedAddress, description)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      return {
        success: true,
        feedAddress,
        description
      }
    },
    onSuccess: () => {
      // Invalidate and refetch feed management data
      queryClient.invalidateQueries({ queryKey: ['feed-management'] })
    }
  })
}

// Hook to perform system health check
export function useSystemHealthCheck() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async () => {
      // TODO: Implement actual system health check
      console.log('Performing system health check')
      
      // Simulate health check
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      return {
        status: 'healthy',
        checks: {
          database: 'ok',
          blockchain: 'ok',
          feeds: 'warning',
          api: 'ok'
        },
        timestamp: new Date().toISOString()
      }
    },
    onSuccess: () => {
      // Invalidate and refetch system status
      queryClient.invalidateQueries({ queryKey: ['system-status'] })
    }
  })
}

// Hook to perform emergency pause
export function useEmergencyPause() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async () => {
      // TODO: Implement actual emergency pause logic
      console.log('Performing emergency pause')
      
      // Simulate emergency pause
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      return {
        success: true,
        paused: true,
        timestamp: new Date().toISOString()
      }
    },
    onSuccess: () => {
      // Invalidate and refetch system status
      queryClient.invalidateQueries({ queryKey: ['system-status'] })
    }
  })
} 