'use client'

import { useState } from 'react'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import { PublicKey, Transaction } from '@solana/web3.js'
import { useSensorSimulationProgram } from './sensor-simulation-data-access'
import { toast } from 'sonner'
import { useTransactionToast } from '../use-transaction-toast'

interface SimulateLeavingButtonProps {
  account: PublicKey
  maker: PublicKey
  feed: PublicKey | null
}

export function SimulateLeavingButton({ account, maker, feed }: SimulateLeavingButtonProps) {
  const { publicKey, signTransaction } = useWallet()
  const { connection } = useConnection()
  const { program } = useSensorSimulationProgram()
  const [isLoading, setIsLoading] = useState(false)
  const transactionToast = useTransactionToast()

  const handleSimulateLeaving = async () => {
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
      toast.error('Only the listing owner can simulate driver leaving')
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

      // Fetch the listing to get the actual renter
      const listingData = await program.account.listing.fetch(account)
      const renter = listingData.reservedBy

      if (!renter) {
        toast.error('No renter found for this listing')
        return
      }

      console.log('Simulating driver leaving for listing:', account.toString())
      console.log('Maker:', maker.toString())
      console.log('Renter:', renter.toString())
      console.log('Feed:', feed.toString())
      console.log('Marketplace:', marketplace.toString())

      // Build the sensorChange transaction
      const transaction = await program.methods
        .sensorChange()
        .accountsPartial({
          feed,
          marketplace: marketplace,
          maker: maker,
          listing: account,
          renter: renter,
        })
        .transaction()

      // Set the maker as fee payer
      transaction.feePayer = maker

      // Get recent blockhash
      const { blockhash } = await connection.getLatestBlockhash()
      transaction.recentBlockhash = blockhash

      // Sign with the maker's wallet
      if (!signTransaction) {
        toast.error('Wallet does not support signing transactions')
        return
      }
      const signedTransaction = await signTransaction(transaction)

      // Send the raw transaction
      const signature = await connection.sendRawTransaction(signedTransaction.serialize())

      console.log('Driver leaving simulation successful:', signature)
      toast.success('Driver leaving simulated successfully!')
      transactionToast(signature)
    } catch (error) {
      console.error('Driver leaving simulation failed:', error)
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
      toast.error(`Failed to simulate driver leaving: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleSimulateLeaving}
      disabled={isLoading || !publicKey || publicKey.toString() !== maker.toString()}
      className={`btn btn-secondary w-full ${
        isLoading ? 'loading' : ''
      } ${
        !publicKey || publicKey.toString() !== maker.toString() 
          ? 'btn-disabled opacity-50' 
          : ''
      }`}
    >
      {isLoading ? 'Simulating...' : 'Simulate Driver Leaving'}
    </button>
  )
} 