'use client'

import { useState, useEffect } from 'react'
import { PublicKey, Transaction } from '@solana/web3.js'
import { useWallet } from '@solana/wallet-adapter-react'
import { useConnection } from '@solana/wallet-adapter-react'
import { toast } from 'sonner'
import { useSensorSimulationProgram } from './sensor-simulation-data-access'

interface EnhancedMultiSigWalletProps {
  account: PublicKey
  maker: PublicKey
  feed: PublicKey | null
  onTransactionComplete?: (signature: string) => void
}

interface PendingTransaction {
  id: string
  type: 'arrival' | 'leaving'
  transaction: string
  createdAt: string
  signedBy: string[]
  requiredSigners: string[]
  listingAddress: string
}

export function EnhancedMultiSigWallet({ account, maker, feed, onTransactionComplete }: EnhancedMultiSigWalletProps) {
  const { program } = useSensorSimulationProgram()
  const { publicKey, signTransaction } = useWallet()
  const { connection } = useConnection()
  
  const [pendingTransactions, setPendingTransactions] = useState<PendingTransaction[]>([])
  const [isCreatingTransaction, setIsCreatingTransaction] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Load pending transactions from API
  const loadPendingTransactions = async () => {
    try {
      console.log('Loading pending transactions...')
      const response = await fetch('/api/multi-sig-transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'list' })
      })
      
      console.log('Load response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('Loaded transactions:', data.transactions)
        
        // Filter transactions to only show those for this specific listing
        const filteredTransactions = (data.transactions || []).filter((tx: any) => {
          return tx.listingAddress === account.toString()
        })
        
        setPendingTransactions(filteredTransactions)
      } else {
        const error = await response.json()
        console.error('Load error:', error)
      }
    } catch (error) {
      console.error('Failed to load pending transactions:', error)
    }
  }

  useEffect(() => {
    loadPendingTransactions()
    // Poll for updates every 10 seconds
    const interval = setInterval(loadPendingTransactions, 10000)
    return () => clearInterval(interval)
  }, [])

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

      // Set fee payer
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

      // Send to backend API
      console.log('Creating transaction with data:', {
        action: 'create',
        account: account.toString(),
        maker: publicKey.toString(),
        feed: feed?.toString(),
        type
      })

      const response = await fetch('/api/multi-sig-transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          base64Transaction,
          account: account.toString(),
          maker: publicKey.toString(),
          feed: feed?.toString(),
          type
        })
      })

      console.log('API response status:', response.status)

      if (response.ok) {
        const data = await response.json()
        console.log('API response data:', data)
        toast.success(data.message)
        loadPendingTransactions() // Refresh the list
      } else {
        const error = await response.json()
        console.error('API error:', error)
        toast.error(error.error || 'Failed to create transaction')
      }

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

    setIsLoading(true)
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

      // Send to backend API
      const response = await fetch('/api/multi-sig-transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'sign',
          transactionId,
          base64Transaction,
          maker: publicKey.toString()
        })
      })

      if (response.ok) {
        const data = await response.json()
        toast.success(data.message)
        
        if (data.signature) {
          // Transaction was completed
          onTransactionComplete?.(data.signature)
        }
        
        loadPendingTransactions() // Refresh the list
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to sign transaction')
      }

    } catch (error) {
      console.error('Failed to sign transaction:', error)
      toast.error(`Failed to sign transaction: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const removePendingTransaction = async (transactionId: string) => {
    try {
      const response = await fetch('/api/multi-sig-transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'remove',
          transactionId
        })
      })

      if (response.ok) {
        toast.success('Transaction removed')
        loadPendingTransactions() // Refresh the list
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to remove transaction')
      }
    } catch (error) {
      console.error('Failed to remove transaction:', error)
      toast.error('Failed to remove transaction')
    }
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
          <h3 className="card-title">Enhanced Multi-Signature Sensor Simulation</h3>
          <p className="text-gray-300">
            Create and manage transactions that require both maker and renter signatures using secure backend storage.
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
          <div className="flex justify-between items-center">
            <h4 className="text-lg font-semibold text-white">Pending Transactions</h4>
            <button
              onClick={loadPendingTransactions}
              disabled={isLoading}
              className="px-4 py-2 text-base font-bold text-gray-300 bg-transparent hover:bg-gray-700 disabled:bg-gray-800 disabled:cursor-not-allowed rounded-lg shadow-md hover:shadow-lg transition-all duration-200 border-2 border-gray-600 hover:border-gray-500"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-300"></div>
                  Refreshing...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  🔄 Refresh
                </span>
              )}
            </button>
          </div>
          
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
                        Created: {new Date(tx.createdAt).toLocaleString()}
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
                        disabled={isLoading}
                        className="w-full px-3 py-2 lg:px-4 lg:py-3 text-sm lg:text-base font-bold text-white bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:cursor-not-allowed rounded-lg shadow-md hover:shadow-lg transition-all duration-200 border-2 border-green-500"
                      >
                        {isLoading ? (
                          <span className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Signing...
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            ✍️ Sign Transaction
                          </span>
                        )}
                      </button>
                    )}
                    
                    {hasSigned(tx) && (
                      <span className="px-3 py-1 text-sm font-bold text-white bg-green-600 rounded-full border-2 border-green-500">
                        ✅ Signed {tx.signedBy.length}/{tx.requiredSigners.length}
                      </span>
                    )}
                    
                    <button
                      onClick={() => removePendingTransaction(tx.id)}
                      disabled={isLoading}
                      className="w-full px-3 py-2 lg:px-4 lg:py-3 text-sm lg:text-base font-bold text-white bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:cursor-not-allowed rounded-lg shadow-md hover:shadow-lg transition-all duration-200 border-2 border-red-500"
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
          <h4 className="font-bold text-white">Enhanced Multi-Signature Features:</h4>
          <ul className="list-disc list-inside mt-2 space-y-1 text-white">
            <li><strong>Secure Backend Storage:</strong> Transactions are stored server-side</li>
            <li><strong>Real-time Updates:</strong> Automatic polling for transaction status</li>
            <li><strong>Persistent State:</strong> Transactions survive page refreshes</li>
            <li><strong>Better Error Handling:</strong> Comprehensive error messages and recovery</li>
            <li><strong>Multi-user Support:</strong> Multiple users can see and sign the same transactions</li>
          </ul>
        </div>
      </div>
    </div>
  )
} 