'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { PublicKey } from '@solana/web3.js'
import { useSensorSimulationProgram } from './sensor-simulation-data-access'
import { useTransactionToast } from '../use-transaction-toast'
import { ellipsify } from '@/lib/utils'

interface SimulateLeavingButtonProps {
  account: PublicKey
  maker: PublicKey
  sensorId: string
}

export function SimulateLeavingButton({ account, maker, sensorId }: SimulateLeavingButtonProps) {
  const { program } = useSensorSimulationProgram()
  const { publicKey, signTransaction } = useWallet()
  const transactionToast = useTransactionToast()

  const handleSimulateLeaving = async () => {
    if (!publicKey) {
      console.error('Please connect your wallet')
      return
    }

    // Check if the connected wallet is the maker
    if (publicKey.toString() !== maker.toString()) {
      console.error('Only the maker can simulate driver leaving')
      return
    }

    console.log('Starting simulate leaving process...')
    console.log('Current user public key:', publicKey.toString())
    console.log('Maker public key:', maker.toString())

    try {
      // Find marketplace PDA
      const marketplace_name = "DePIN PANORAMA PARKING"
      const [marketplace] = PublicKey.findProgramAddressSync(
        [Buffer.from("marketplace"), Buffer.from(marketplace_name)],
        program.programId
      )

      // Find listing PDA
      const [listing] = PublicKey.findProgramAddressSync(
        [marketplace.toBuffer(), maker.toBuffer()],
        program.programId
      )

      // Get the listing data to find the renter
      const listingAccount = await program.account.listing.fetch(listing)
      const renter = listingAccount.reservedBy

      if (!renter) {
        console.error('No renter found for this listing')
        alert('No renter found for this listing. The parking space must be reserved or occupied.')
        return
      }

      console.log('PDAs derived:', {
        marketplace: marketplace.toString(),
        listing: listing.toString(),
        renter: renter.toString()
      })

      // Create the transaction with sensorChange instruction
      const transaction = await program.methods
        .sensorChange()
        .accountsPartial({
          feed: new PublicKey("9jfL52Gmudwee1RK8yuNguoZET7DMDqKSR6DePBJNXot"),
          marketplace: marketplace,
          maker: maker,
          listing: listing,
          renter: renter,
        })
        .transaction()

      // Set the fee payer to the maker
      transaction.feePayer = maker

      // Get latest blockhash
      const { blockhash } = await program.provider.connection.getLatestBlockhash()
      transaction.recentBlockhash = blockhash

      // Sign the transaction with the maker's wallet
      if (!signTransaction) {
        throw new Error('Wallet cannot sign transactions')
      }
      
      const signedTransaction = await signTransaction(transaction)

      console.log('Transaction signed by maker')

      // Serialize the signed transaction
      const serializedTransaction = signedTransaction.serialize({
        requireAllSignatures: false,
        verifySignatures: false
      })

      // Send the transaction to the network
      const signature = await program.provider.connection.sendRawTransaction(
        serializedTransaction,
        {
          skipPreflight: false,
          preflightCommitment: 'confirmed'
        }
      )

      console.log('Transaction sent to network:', signature)

      // Wait for confirmation
      const confirmation = await program.provider.connection.confirmTransaction(
        signature,
        'confirmed'
      )

      if (confirmation.value.err) {
        throw new Error(`Transaction failed: ${confirmation.value.err}`)
      }

      console.log('Transaction confirmed successfully')
      transactionToast(signature)

      // Show success message
      alert(`Driver leaving simulation successful!\n\nTransaction signature: ${ellipsify(signature)}\n\nStatus: ${JSON.stringify(listingAccount.parkingSpaceStatus)}`)

    } catch (error) {
      console.error('Simulate leaving failed:', error)
      console.error('Error details:', error)
      alert('Failed to simulate driver leaving. Please check the console for details.')
    }
  }

  return (
    <button
      onClick={handleSimulateLeaving}
      className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
    >
      Simulate Driver Leaving (Homeowner calls this ix)
    </button>
  )
} 