'use client'

import { useSensorSimulationProgram } from './sensor-simulation-data-access';
import { SensorSimulationCard } from './sensor-simulation-card';
import { PublicKey } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';

interface SensorSimulationUIProps {
  searchTerm: string;
}

export function SensorSimulationUI({ searchTerm }: SensorSimulationUIProps) {
  const { accounts } = useSensorSimulationProgram();
  const { publicKey } = useWallet();

  // Check if wallet is connected
  if (!publicKey) {
    return (
      <div className="text-center">
        <div className="bg-gray-800 border-2 border-gray-700 rounded-lg p-8 max-w-md mx-auto">
          <h3 className="text-xl font-bold text-white mb-4">Connect Your Wallet</h3>
          <p className="text-gray-300 mb-6">
            Please connect your wallet to access the Sensor Simulation dashboard.
          </p>
          <div className="text-yellow-400">
            <p className="text-sm">
              💡 Tip: Use the wallet connection button in the header to connect your wallet.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (accounts.isLoading) {
    return (
      <div className="text-center">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
        <p className="text-white mt-4">Loading parking spaces...</p>
      </div>
    );
  }

  if (accounts.error) {
    return (
      <div className="text-center">
        <div className="bg-red-600 border-2 border-red-500 rounded-lg p-4 max-w-md mx-auto">
          <span className="font-bold text-white">Error loading parking spaces: {accounts.error.message}</span>
        </div>
      </div>
    );
  }

  if (!accounts.data || accounts.data.length === 0) {
    return (
      <div className="text-center">
        <p className="text-white text-lg">No parking spaces found.</p>
        <p className="text-gray-400">Create a listing in the Homeowners section to get started.</p>
      </div>
    );
  }

  // Filter accounts based on search term
  const filteredAccounts = accounts.data.filter((account: { publicKey: PublicKey; account: { address?: string; sensorId?: string } }) => {
    const address = account.account.address || '';
    const sensorId = account.account.sensorId || '';
    const searchLower = searchTerm.toLowerCase();
    
    return (
      address.toLowerCase().includes(searchLower) ||
      sensorId.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="w-full max-w-6xl">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAccounts.map((account: { publicKey: PublicKey; account: { maker: PublicKey; feed: PublicKey | null } }) => (
          <SensorSimulationCard
            key={account.publicKey.toString()}
            account={account.publicKey}
            maker={account.account.maker}
            feed={account.account.feed}
          />
        ))}
      </div>
    </div>
  );
} 