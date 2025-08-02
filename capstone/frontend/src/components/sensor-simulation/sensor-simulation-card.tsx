'use client'

import { useQuery } from '@tanstack/react-query'
import { PublicKey } from '@solana/web3.js'
import { useSensorSimulationProgram } from './sensor-simulation-data-access'
import { ellipsify } from '@/lib/utils'
import { SensorChangeButton } from './sensor-change-button'
import { SimulateLeavingButton } from './simulate-leaving-button'

interface SensorSimulationCardProps {
  account: PublicKey
  maker: PublicKey
  feed: PublicKey | null
}

export function SensorSimulationCard({ account, maker, feed }: SensorSimulationCardProps) {
  const { program } = useSensorSimulationProgram()

  const accountQuery = useQuery({
    queryKey: ['sensor-simulation', 'account', account.toString()],
    queryFn: () => program.account.listing.fetch(account),
  })

  if (accountQuery.isLoading) {
    return (
      <div className="card bg-gray-800 text-white shadow-xl">
        <div className="card-body">
          <div className="loading loading-spinner loading-md"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  if (accountQuery.error) {
    return (
      <div className="card bg-gray-800 text-white shadow-xl">
        <div className="card-body">
          <div className="alert alert-error">
            <span>Error: {accountQuery.error.message}</span>
          </div>
        </div>
      </div>
    )
  }

  const listingData = accountQuery.data

  return (
    <div className="card bg-gray-800 text-white shadow-xl">
      <div className="card-body">
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
        <div className="card-actions justify-end mt-4">
          <div className="flex flex-col gap-2 w-full">
            <SensorChangeButton 
              account={account} 
              maker={maker} 
              feed={feed} 
            />
            <SimulateLeavingButton 
              account={account} 
              maker={maker} 
              feed={feed} 
            />
          </div>
        </div>
      </div>
    </div>
  )
} 