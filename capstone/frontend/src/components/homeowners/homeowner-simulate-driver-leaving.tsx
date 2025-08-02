'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { PublicKey } from '@solana/web3.js'
import { useMarketplaceProgram } from './homeowner-data-access'
import { useTransactionToast } from '../use-transaction-toast'

interface SimulateLeavingButtonProps {
  account: PublicKey
  maker: PublicKey
  sensorId: string
}

export function SimulateLeavingButton({ account, maker, sensorId }: SimulateLeavingButtonProps) {
  const { program } = useMarketplaceProgram()
  const { publicKey } = useWallet()
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

      console.log('PDAs derived:', {
        marketplace: marketplace.toString(),
        listing: listing.toString()
      })

      // Call the sensorChange instruction to simulate driver leaving
      const signature = await program.methods
        .sensorChange()
        .accountsPartial({
          feed: new PublicKey("9jfL52Gmudwee1RK8yuNguoZET7DMDqKSR6DePBJNXot"), // Switchboard feed
          marketplace: marketplace,
          maker: maker,
          listing: listing,
          renter: new PublicKey("11111111111111111111111111111111"), // Placeholder - will be filled by program
        })
        .rpc()

      console.log('Simulate leaving transaction successful:', signature)
      transactionToast(signature)

    } catch (error) {
      console.error('Simulate leaving failed:', error)
      console.error('Error details:', error)
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