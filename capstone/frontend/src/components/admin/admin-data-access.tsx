'use client'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { PublicKey, SystemProgram } from '@solana/web3.js'
import { useMarketplaceProgram } from '../homeowners/homeowner-data-access'

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
  const { program } = useMarketplaceProgram()
  const { publicKey } = useWallet()
  
  return useMutation({
    mutationFn: async ({ feedAddress, makerAddress, description }: { feedAddress: string, makerAddress: string, description: string }) => {
      if (!program || !publicKey) {
        throw new Error('Program or wallet not available')
      }

      try {
        // Convert addresses to PublicKey
        const feedPubkey = new PublicKey(feedAddress)
        const makerPubkey = new PublicKey(makerAddress)
        
        // Get marketplace account
        const [marketplacePda] = PublicKey.findProgramAddressSync(
          [Buffer.from('marketplace'), Buffer.from('DePIN PANORAMA PARKING')],
          program.programId
        )
        
        // Check if marketplace exists
        const marketplaceAccount = await program.account.marketplace.fetch(marketplacePda).catch(() => null)
        if (!marketplaceAccount) {
          throw new Error('Marketplace not initialized. Please initialize the marketplace first.')
        }
        
        // Get listing PDA
        const [listingPda] = PublicKey.findProgramAddressSync(
          [marketplacePda.toBuffer(), makerPubkey.toBuffer()],
          program.programId
        )
        
        // Check if listing exists
        const listingAccount = await program.account.listing.fetch(listingPda).catch(() => null)
        if (!listingAccount) {
          throw new Error('Listing not found for the specified maker address.')
        }
        
        // Call the addFeedToListing instruction
        const tx = await program.methods
          .addFeedToListing(feedPubkey)
          .accountsPartial({
            marketplace: marketplacePda,
            maker: makerPubkey,
            listing: listingPda,
            admin: publicKey,
          })
          .rpc()
        
        console.log('Feed added successfully:', tx)
        
        return {
          success: true,
          feedAddress,
          makerAddress,
          description,
          tx
        }
      } catch (error) {
        console.error('Error adding feed:', error)
        if (error instanceof Error) {
          throw new Error(`Failed to add feed: ${error.message}`)
        }
        throw new Error('Failed to add feed: Unknown error')
      }
    },
    onSuccess: () => {
      // Invalidate and refetch feed management data
      queryClient.invalidateQueries({ queryKey: ['feed-management'] })
      queryClient.invalidateQueries({ queryKey: ['admin-listings'] })
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