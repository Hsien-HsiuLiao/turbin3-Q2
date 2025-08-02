'use client'

import { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { PublicKey } from '@solana/web3.js'
import { useSensorSimulationProgram } from './sensor-simulation-data-access'
import { toast } from 'sonner'
import { useTransactionToast } from '../use-transaction-toast'

interface SensorChangeButtonProps {
  account: PublicKey
  maker: PublicKey
  feed: PublicKey | null
}

export function SensorChangeButton({ account, maker, feed }: SensorChangeButtonProps) {
  const { publicKey } = useWallet()
  const { program } = useSensorSimulationProgram()
  const [isLoading, setIsLoading] = useState(false)
  const transactionToast = useTransactionToast()

  const simulateSensorChange = async () => {
    if (!publicKey) {
      toast.error('Please connect your wallet first')
      return
    }

    if (!feed) {
      toast.error('No feed assigned to this listing')
      return
    }

    // Check if the connected wallet is the maker
    if (publicKey.toString() !== maker.toString()) {
      toast.error('Only the listing owner can simulate sensor changes')
      return
    }

    setIsLoading(true)

    try {
      // Derive marketplace PDA
      const marketplace_name = "DePIN PANORAMA PARKING"
      const [marketplace] = PublicKey.findProgramAddressSync(
        [Buffer.from("marketplace"), Buffer.from(marketplace_name)],
        program.programId
      )

      console.log('Simulating sensor change for listing:', account.toString())
      console.log('Maker:', maker.toString())
      console.log('Feed:', feed.toString())
      console.log('Marketplace:', marketplace.toString())

      const signature = await program.methods
        .sensorChange()
        .accountsPartial({
          feed,
          marketplace: marketplace,
          maker: maker,
          listing: account,
          renter: publicKey, // Renter is signer
        })
        .signers([]) // No explicit signers here, relies on wallet adapter
        .rpc()

      console.log('Sensor change simulation successful:', signature)
      toast.success('Sensor change simulated successfully!')
      transactionToast(signature)
    } catch (error) {
      console.error('Sensor change simulation failed:', error)
      if (error && typeof error === 'object' && 'logs' in error) {
        console.error('Transaction logs:', (error as { logs: unknown }).logs)
      }
      if (error && typeof error === 'object' && 'error' in error) {
        console.error('Error details:', (error as { error: unknown }).error)
      }
      console.error('Full error object:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        name: error instanceof Error ? error.name : 'Unknown',
        stack: error instanceof Error ? error.stack : 'No stack trace',
        transactionMessage: error && typeof error === 'object' && 'transactionMessage' in error ? (error as { transactionMessage: unknown }).transactionMessage : 'N/A',
        transactionLogs: error && typeof error === 'object' && 'transactionLogs' in error ? (error as { transactionLogs: unknown }).transactionLogs : 'N/A',
        programErrorStack: error && typeof error === 'object' && 'programErrorStack' in error ? (error as { programErrorStack: unknown }).programErrorStack : 'N/A',
        errorLogs: error && typeof error === 'object' && 'errorLogs' in error ? (error as { errorLogs: unknown }).errorLogs : 'N/A',
        fullError: error
      })
      toast.error(`Failed to simulate sensor change: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={simulateSensorChange}
      disabled={isLoading || !publicKey || publicKey.toString() !== maker.toString()}
      className={`btn btn-primary w-full ${
        isLoading ? 'loading' : ''
      } ${
        !publicKey || publicKey.toString() !== maker.toString() 
          ? 'btn-disabled opacity-50' 
          : ''
      }`}
    >
      {isLoading ? 'Simulating...' : 'Simulate Car Arrival'}
    </button>
  )
} 