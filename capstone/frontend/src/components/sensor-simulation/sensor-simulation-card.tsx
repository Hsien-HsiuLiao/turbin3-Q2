'use client'

import { useQuery } from '@tanstack/react-query'
import { PublicKey, Transaction, Keypair } from '@solana/web3.js'
import { useSensorSimulationProgram } from './sensor-simulation-data-access'
import { ellipsify } from '@/lib/utils'
import { SensorChangeButton } from './sensor-change-button'
import { SimulateLeavingButton } from './simulate-leaving-button'
import { MultiSigWallet } from './multi-sig-wallet'
import { EnhancedMultiSigWallet } from './enhanced-multi-sig-wallet'
import { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { toast } from 'sonner'

interface SensorSimulationCardProps {
  account: PublicKey
  maker: PublicKey
  feed: PublicKey | null
}

export function SensorSimulationCard({ account, maker, feed }: SensorSimulationCardProps) {
  const { program } = useSensorSimulationProgram()
  const { publicKey, signTransaction } = useWallet()
  const [partiallySignedTx, setPartiallySignedTx] = useState<string | null>(null)
  const [pendingTxType, setPendingTxType] = useState<'arrival' | 'leaving' | null>(null)
  const [showMultiSig, setShowMultiSig] = useState(false)
  const [multiSigType, setMultiSigType] = useState<'basic' | 'enhanced'>('enhanced')

  const accountQuery = useQuery({
    queryKey: ['sensor-simulation', 'account', account.toString()],
    queryFn: () => program.account.listing.fetch(account),
  })

  const completeTransaction = async () => {
    if (!partiallySignedTx || !signTransaction || !publicKey) {
      toast.error('No pending transaction or wallet not connected')
      return
    }

    try {
      // The sensorChange instruction requires both maker and renter signatures
      // This is a limitation of the current program design
      // For now, let's show a helpful error message
      
      const listingData = await program.account.listing.fetch(account)
      const isMaker = listingData.maker.equals(publicKey)
      const isRenter = listingData.reservedBy && listingData.reservedBy.equals(publicKey)
      
      console.log('Current wallet analysis:', {
        currentWallet: publicKey.toString(),
        isMaker,
        isRenter,
        maker: listingData.maker.toString(),
        renter: listingData.reservedBy?.toString() || 'None'
      })
      
      if (!isMaker && !isRenter) {
        toast.error(`Current wallet (${publicKey.toString()}) is not authorized to sign this transaction. Only the maker (${listingData.maker.toString()}) and renter (${listingData.reservedBy?.toString() || 'None'}) can sign.`)
        return
      }
      
      // For now, let's show that this requires both parties to sign simultaneously
      toast.error(`The sensorChange instruction requires both the maker and renter to sign the same transaction. This cannot be done sequentially with wallet extensions. Consider using a different approach or modifying the program to allow single-signer operations.`)
      
      // Clear the pending transaction
      setPartiallySignedTx(null)
      setPendingTxType(null)
      
    } catch (error) {
      console.error('Failed to complete transaction:', error)
      toast.error(`Failed to complete transaction: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  if (accountQuery.isLoading) {
    return (
      <div className="bg-gray-800 text-white shadow-xl rounded-lg border-2 border-gray-700">
        <div className="p-6">
          <div className="flex items-center justify-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            <p className="text-lg">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  if (accountQuery.error) {
    return (
      <div className="bg-gray-800 text-white shadow-xl rounded-lg border-2 border-gray-700">
        <div className="p-6">
          <div className="bg-red-600 border-2 border-red-500 rounded-lg p-4">
            <span className="font-bold">Error: {accountQuery.error.message}</span>
          </div>
        </div>
      </div>
    )
  }

  const listingData = accountQuery.data

  return (
    <div className="bg-gray-800 text-white shadow-xl rounded-lg border-2 border-gray-700">
      <div className="p-6">
        <h2 className="card-title text-xl font-bold mb-4">Parking Space Simulation</h2>
        
        {/* Home Address */}
        <div className="block text-sm font-medium text-white">
          <span className="font-semibold">Home Address: </span>
          <span className="text-gray-300">{listingData?.address || 'No address'}</span>
        </div>

        {/* Created By */}
        <div className="block text-sm font-medium text-white">
          <span className="font-semibold">Created By: </span>
          <span className="text-gray-300 font-mono text-xs">
            {ellipsify(maker.toString())}
          </span>
        </div>

        {/* Sensor ID */}
        <div className="block text-sm font-medium text-white">
          <span className="font-semibold">Sensor ID: </span>
          <span className="text-gray-300">{listingData?.sensorId || 'No sensor ID'}</span>
        </div>

        {/* Feed */}
        <div className="block text-sm font-medium text-white">
          <span className="font-semibold">Feed: </span>
          {feed ? (
            <a 
              href={`https://ondemand.switchboard.xyz/solana/devnet/feed/${feed.toString()}`} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-blue-400 hover:text-blue-300 hover:underline font-mono text-xs"
              title="View feed on Switchboard"
            >
              {ellipsify(feed.toString())}
            </a>
          ) : (
            <span className="text-gray-500">No feed assigned</span>
          )}
        </div>

        {/* Parking Space Status */}
        <div className="block text-sm font-medium text-white">
          <span className="font-semibold">Parking Space Status: </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            listingData?.parkingSpaceStatus && 'available' in listingData.parkingSpaceStatus 
              ? 'bg-green-100 text-green-800' 
              : listingData?.parkingSpaceStatus && 'reserved' in listingData.parkingSpaceStatus
              ? 'bg-yellow-100 text-yellow-800'
              : listingData?.parkingSpaceStatus && 'occupied' in listingData.parkingSpaceStatus
              ? 'bg-red-100 text-red-800'
              : 'bg-gray-100 text-gray-800'
          }`}>
            {listingData?.parkingSpaceStatus && 'available' in listingData.parkingSpaceStatus 
              ? 'Available' 
              : listingData?.parkingSpaceStatus && 'reserved' in listingData.parkingSpaceStatus
              ? 'Reserved'
              : listingData?.parkingSpaceStatus && 'occupied' in listingData.parkingSpaceStatus
              ? 'Occupied'
              : 'Unknown'
            }
          </span>
        </div>

        {/* Reserved By Information */}
        {listingData?.parkingSpaceStatus && 'reserved' in listingData.parkingSpaceStatus && listingData?.reservedBy && (
          <div className="block text-sm font-medium text-white">
            <span className="font-semibold">Reserved By: </span>
            <span className="text-gray-300 font-mono text-xs">
              {ellipsify(listingData.reservedBy.toString())}
            </span>
          </div>
        )}

        {/* Occupied By Information */}
        {listingData?.parkingSpaceStatus && 'occupied' in listingData.parkingSpaceStatus && listingData?.reservedBy && (
          <div className="block text-sm font-medium text-white">
            <span className="font-semibold">Occupied By: </span>
            <span className="text-gray-300 font-mono text-xs">
              {ellipsify(listingData.reservedBy.toString())}
            </span>
          </div>
        )}

        {/* Simulation Controls */}
                            <div className="mt-6">
                      <div className="flex flex-col gap-2 w-full">
                        {/* Multi-Signature Option */}
                        <div className="flex flex-col gap-3 mb-4">
                          <button
                            onClick={() => setShowMultiSig(!showMultiSig)}
                            className="w-full px-6 py-4 text-lg font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 border-2 border-purple-500"
                          >
                            {showMultiSig ? (
                              <span className="flex items-center gap-2">
                                🔽 Hide Multi-Signature Wallet
                              </span>
                            ) : (
                              <span className="flex items-center gap-2">
                                🔼 Show Multi-Signature Wallet
                              </span>
                            )}
                          </button>
                          
                          {showMultiSig && (
                            <div className="flex gap-3">
                              <button
                                onClick={() => setMultiSigType('basic')}
                                className={`flex-1 px-6 py-4 text-lg font-bold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 border-2 ${
                                  multiSigType === 'basic' 
                                    ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-500' 
                                    : 'bg-transparent hover:bg-gray-700 text-gray-300 border-gray-600 hover:border-gray-500'
                                }`}
                              >
                                📱 Basic Mode
                              </button>
                              <button
                                onClick={() => setMultiSigType('enhanced')}
                                className={`flex-1 px-6 py-4 text-lg font-bold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 border-2 ${
                                  multiSigType === 'enhanced' 
                                    ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-500' 
                                    : 'bg-transparent hover:bg-gray-700 text-gray-300 border-gray-600 hover:border-gray-500'
                                }`}
                              >
                                🚀 Enhanced Mode
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Multi-Signature Wallet */}
                        {showMultiSig && (
                          <>
                            {multiSigType === 'basic' && (
                              <MultiSigWallet
                                account={account}
                                maker={maker}
                                feed={feed}
                                onTransactionComplete={(signature) => {
                                  console.log('Multi-sig transaction completed:', signature)
                                  // Refresh the listing data
                                  accountQuery.refetch()
                                }}
                              />
                            )}
                            
                            {multiSigType === 'enhanced' && (
                              <EnhancedMultiSigWallet
                                account={account}
                                maker={maker}
                                feed={feed}
                                onTransactionComplete={(signature) => {
                                  console.log('Enhanced multi-sig transaction completed:', signature)
                                  // Refresh the listing data
                                  accountQuery.refetch()
                                }}
                              />
                            )}
                          </>
                        )}

                        {/* Legacy Two-Step Signing (Limited) */}
                        {!showMultiSig && (
                          <>
                            <div className="bg-orange-600 border-2 border-orange-500 rounded-lg p-4 mb-4">
                              <span className="font-bold">
                                <strong>Note:</strong> The legacy two-step signing approach has limitations. 
                                Consider using the Multi-Signature Wallet above for better functionality.
                              </span>
                            </div>
                            
                            {/* Step 1: Initial signing buttons */}
                            {!partiallySignedTx && (
                              <>
                                <SensorChangeButton 
                                  account={account} 
                                  maker={maker} 
                                  feed={feed}
                                  onTransactionCreated={(base64Tx) => {
                                    setPartiallySignedTx(base64Tx)
                                    setPendingTxType('arrival')
                                    toast.success('Transaction created! Switch to the second wallet and click "Complete Transaction"')
                                  }}
                                />
                                <SimulateLeavingButton 
                                  account={account} 
                                  maker={maker} 
                                  feed={feed}
                                  onTransactionCreated={(base64Tx) => {
                                    setPartiallySignedTx(base64Tx)
                                    setPendingTxType('leaving')
                                    toast.success('Transaction created! Switch to the second wallet and click "Complete Transaction"')
                                  }}
                                />
                              </>
                            )}

                            {/* Step 2: Complete transaction button */}
                            {partiallySignedTx && (
                              <div className="space-y-2">
                                                            <div className="bg-orange-600 border-2 border-orange-500 rounded-lg p-4 mb-4">
                              <span className="font-bold">
                                <strong>Multi-Signature Limitation:</strong> The sensorChange instruction requires both the maker and renter to sign the same transaction simultaneously. This cannot be done sequentially with wallet extensions.
                              </span>
                            </div>
                            <div className="bg-blue-600 border-2 border-blue-500 rounded-lg p-4 mb-4">
                              <span>
                                Pending {pendingTxType === 'arrival' ? 'car arrival' : 'driver leaving'} transaction. 
                                This requires both parties to sign together.
                              </span>
                            </div>
                                                            <button
                              onClick={completeTransaction}
                              className="w-full px-6 py-4 text-lg font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 border-2 border-orange-500"
                            >
                              🔍 Check Authorization & Show Details
                            </button>
                            <button
                              onClick={() => {
                                setPartiallySignedTx(null)
                                setPendingTxType(null)
                              }}
                              className="w-full px-4 py-3 text-base font-bold text-gray-300 bg-transparent hover:bg-gray-700 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 border-2 border-gray-600 hover:border-gray-500"
                            >
                              ❌ Cancel Transaction
                            </button>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
      </div>
    </div>
  )
} 