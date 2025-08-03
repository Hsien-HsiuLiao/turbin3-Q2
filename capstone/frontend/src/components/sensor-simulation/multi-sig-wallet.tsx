'use client'

import { useState, useEffect } from 'react'
import { PublicKey, Transaction, Keypair } from '@solana/web3.js'
import { useWallet } from '@solana/wallet-adapter-react'
import { useConnection } from '@solana/wallet-adapter-react'
import { toast } from 'sonner'
import { useSensorSimulationProgram } from './sensor-simulation-data-access'

interface MultiSigWalletProps {
  account: PublicKey
  maker: PublicKey
  feed: PublicKey | null
  onTransactionComplete?: (signature: string) => void
}

interface PendingTransaction {
  id: string
  type: 'arrival' | 'leaving'
  transaction: string // base64 encoded
  createdAt: Date
  signedBy: string[]
  requiredSigners: string[]
  listingAddress: string
}

export function MultiSigWallet({ account, maker, feed, onTransactionComplete }: MultiSigWalletProps) {
  const { program } = useSensorSimulationProgram()
  const { publicKey, signTransaction } = useWallet()
  const { connection } = useConnection()
  
  const [pendingTransactions, setPendingTransactions] = useState<PendingTransaction[]>([])
  const [isCreatingTransaction, setIsCreatingTransaction] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<string | null>(null)

  // Load pending transactions from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('pending-sensor-transactions')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        // Filter transactions to only show those for this specific listing
        const filteredTransactions = parsed.filter((tx: PendingTransaction) => {
          return tx.listingAddress === account.toString()
        })
        setPendingTransactions(filteredTransactions)
      } catch (error) {
        console.error('Failed to parse saved transactions:', error)
      }
    }
  }, [account])

  // Save pending transactions to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('pending-sensor-transactions', JSON.stringify(pendingTransactions))
  }, [pendingTransactions])

  const createSensorChangeTransaction = async (type: 'arrival' | 'leaving') => {
    if (!publicKey || !signTransaction) {
      toast.error('Wallet not connected')
      return
    }

    setIsCreatingTransaction(true)
    try {
      // Get listing data to determine required signers
      const listingData = await program.account.listing.fetch(account)
      const renter = listingData.reservedBy
      
      if (!renter) {
        toast.error('No renter found for this listing')
        return
      }

      const requiredSigners = [maker.toString(), renter.toString()]
      
      // Create the transaction
      const transaction = await program.methods
        .sensorChange()
        .accountsPartial({
          feed: feed || new PublicKey("9jfL52Gmudwee1RK8yuNguoZET7DMDqKSR6DePBJNXot"),
          marketplace: (() => {
            const marketplace_name = "DePIN PANORAMA PARKING"
            return PublicKey.findProgramAddressSync(
              [Buffer.from("marketplace"), Buffer.from(marketplace_name)],
              program.programId
            )[0]
          })(),
          maker: listingData.maker,
          listing: account,
          renter: renter,
        })
        .transaction()

      // Set fee payer (use the current signer)
      transaction.feePayer = publicKey

      // Get latest blockhash
      const { blockhash } = await connection.getLatestBlockhash()
      transaction.recentBlockhash = blockhash

      // Sign with current wallet
      const signedTransaction = await signTransaction(transaction)
      
      // Serialize the transaction
      const serializedTransaction = signedTransaction.serialize({
        requireAllSignatures: false,
        verifySignatures: false
      })

      const base64Transaction = serializedTransaction.toString('base64')

      // Create pending transaction record
      const pendingTx: PendingTransaction = {
        id: `${Date.now()}-${Math.random()}`,
        type,
        transaction: base64Transaction,
        createdAt: new Date(),
        signedBy: [publicKey.toString()],
        requiredSigners,
        listingAddress: account.toString()
      }

      setPendingTransactions(prev => [...prev, pendingTx])
      toast.success(`Transaction created! Waiting for ${type === 'arrival' ? 'renter' : 'maker'} signature.`)

    } catch (error) {
      console.error('Failed to create transaction:', error)
      toast.error(`Failed to create transaction: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsCreatingTransaction(false)
    }
  }

  const signPendingTransaction = async (transactionId: string) => {
    if (!publicKey || !signTransaction) {
      toast.error('Wallet not connected')
      return
    }

    const pendingTx = pendingTransactions.find(tx => tx.id === transactionId)
    if (!pendingTx) {
      toast.error('Transaction not found')
      return
    }

    // Check if current wallet is a required signer
    if (!pendingTx.requiredSigners.includes(publicKey.toString())) {
      toast.error('You are not authorized to sign this transaction')
      return
    }

    // Check if already signed
    if (pendingTx.signedBy.includes(publicKey.toString())) {
      toast.error('You have already signed this transaction')
      return
    }

    try {
      // Deserialize the transaction
      const transaction = Transaction.from(Buffer.from(pendingTx.transaction, 'base64'))
      
      // Sign with current wallet
      const signedTransaction = await signTransaction(transaction)
      
      // Serialize the fully signed transaction
      const serializedTransaction = signedTransaction.serialize({
        requireAllSignatures: false,
        verifySignatures: false
      })

      const base64Transaction = serializedTransaction.toString('base64')

      // Update the pending transaction
      const updatedTx = {
        ...pendingTx,
        transaction: base64Transaction,
        signedBy: [...pendingTx.signedBy, publicKey.toString()]
      }

      setPendingTransactions(prev => 
        prev.map(tx => tx.id === transactionId ? updatedTx : tx)
      )

      // Check if all required signers have signed
      const allSigned = updatedTx.requiredSigners.every(signer => 
        updatedTx.signedBy.includes(signer)
      )

      if (allSigned) {
        // Send the transaction
        const signature = await connection.sendRawTransaction(
          serializedTransaction,
          {
            skipPreflight: false,
            preflightCommitment: 'confirmed'
          }
        )

        console.log('Multi-sig transaction completed:', signature)
        toast.success(`${pendingTx.type === 'arrival' ? 'Car arrival' : 'Driver leaving'} simulation completed!`)
        
        // Remove from pending transactions
        setPendingTransactions(prev => prev.filter(tx => tx.id !== transactionId))
        
        // Call completion callback
        onTransactionComplete?.(signature)
      } else {
        toast.success('Transaction signed! Waiting for other signer.')
      }

    } catch (error) {
      console.error('Failed to sign transaction:', error)
      toast.error(`Failed to sign transaction: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const removePendingTransaction = (transactionId: string) => {
    setPendingTransactions(prev => prev.filter(tx => tx.id !== transactionId))
    toast.success('Transaction removed')
  }

  const isAuthorizedSigner = (transaction: PendingTransaction) => {
    return publicKey && transaction.requiredSigners.includes(publicKey.toString())
  }

  const hasSigned = (transaction: PendingTransaction) => {
    return publicKey && transaction.signedBy.includes(publicKey.toString())
  }

  return (
    <div className="space-y-4">
      <div className="bg-gray-800 text-white shadow-xl rounded-lg border-2 border-gray-700">
        <div className="p-6">
          <h3 className="card-title">Multi-Signature Sensor Simulation</h3>
          <p className="text-gray-300">
            Create transactions that require both maker and renter signatures.
          </p>
          
          <div className="flex flex-col gap-3">
            <button
              onClick={() => createSensorChangeTransaction('arrival')}
              disabled={isCreatingTransaction}
              className="w-full px-6 py-4 text-lg font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 border-2 border-blue-500"
            >
              {isCreatingTransaction ? (
                <span className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Creating Car Arrival Transaction...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  🚗 Create Car Arrival Transaction
                </span>
              )}
            </button>
            
            <button
              onClick={() => createSensorChangeTransaction('leaving')}
              disabled={isCreatingTransaction}
              className="w-full px-6 py-4 text-lg font-bold text-white bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 disabled:cursor-not-allowed rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 border-2 border-gray-500"
            >
              {isCreatingTransaction ? (
                <span className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Creating Driver Leaving Transaction...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  🚶 Create Driver Leaving Transaction
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Pending Transactions */}
      {pendingTransactions.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-white">Pending Transactions</h4>
          
          {pendingTransactions.map((tx) => (
            <div key={tx.id} className="bg-gray-700 text-white shadow-lg rounded-lg border-2 border-gray-600">
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex-1 min-w-0">
                    <h5 className="font-semibold text-lg mb-2">
                      {tx.type === 'arrival' ? 'Car Arrival' : 'Driver Leaving'} Simulation
                    </h5>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-300">
                        Created: {tx.createdAt.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-300 break-all">
                        Required Signers: {tx.requiredSigners.join(', ')}
                      </p>
                      <p className="text-sm text-gray-300 break-all">
                        Signed By: {tx.signedBy.join(', ') || 'None'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2 w-full">
                    {isAuthorizedSigner(tx) && !hasSigned(tx) && (
                      <button
                        onClick={() => signPendingTransaction(tx.id)}
                        className="w-full px-3 py-2 lg:px-4 lg:py-3 text-sm lg:text-base font-bold text-white bg-green-600 hover:bg-green-700 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 border-2 border-green-500"
                      >
                        ✍️ Sign Transaction
                      </button>
                    )}
                    
                    {hasSigned(tx) && (
                      <span className="px-3 py-1 text-sm font-bold text-white bg-green-600 rounded-full border-2 border-green-500">
                        ✅ Signed {tx.signedBy.length}/{tx.requiredSigners.length}
                      </span>
                    )}
                    
                    <button
                      onClick={() => removePendingTransaction(tx.id)}
                      className="w-full px-3 py-2 lg:px-4 lg:py-3 text-sm lg:text-base font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 border-2 border-red-500"
                    >
                      🗑️ Remove Transaction
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-600 border-2 border-blue-500 rounded-lg p-4">
        <div>
          <h4 className="font-bold text-white">How to use Multi-Signature:</h4>
          <ol className="list-decimal list-inside mt-2 space-y-1 text-white">
            <li>Create a transaction (either party can do this)</li>
            <li>Switch to the other wallet that needs to sign</li>
            <li>Click "Sign Transaction" to add the second signature</li>
            <li>The transaction will automatically execute when both parties have signed</li>
          </ol>
        </div>
      </div>
    </div>
  )
} 