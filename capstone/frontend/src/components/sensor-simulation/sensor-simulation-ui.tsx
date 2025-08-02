'use client'

import { useSensorSimulationProgram } from './sensor-simulation-data-access';
import { SensorSimulationCard } from './sensor-simulation-card';
import { PublicKey } from '@solana/web3.js';

interface SensorSimulationUIProps {
  searchTerm: string;
}

export function SensorSimulationUI({ searchTerm }: SensorSimulationUIProps) {
  const { accounts } = useSensorSimulationProgram();

  if (accounts.isLoading) {
    return (
      <div className="text-center">
        <div className="loading loading-spinner loading-lg"></div>
        <p className="text-white mt-4">Loading parking spaces...</p>
      </div>
    );
  }

  if (accounts.error) {
    return (
      <div className="text-center">
        <div className="alert alert-error">
          <span>Error loading parking spaces: {accounts.error.message}</span>
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