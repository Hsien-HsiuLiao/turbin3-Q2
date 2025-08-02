"use client";

import * as anchor from '@coral-xyz/anchor';

import { Keypair, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
// import { useMemo } from 'react';
import { ellipsify } from '@/lib/utils'
import { ExplorerLink } from "../cluster/cluster-ui";
import {

  useMarketplaceProgram,
  useMarketplaceProgramAccount
} from "./driver-data-access";
import { useWallet } from "@solana/wallet-adapter-react";

import { useEffect, useState } from "react";
import dayjs from 'dayjs';
import { ConfirmArrivalButton } from './driver-confirm-arrival';
import { GpsNavigationButton } from './driver-gps-navigation';


function DebugTable({ accounts }: { accounts: { publicKey: PublicKey; account: unknown }[] }) {
  return (
    <div className="mb-8 p-4 bg-gray-100 rounded-lg">
      <h3 className="text-lg font-semibold mb-4 text-black">Debug: All Listings Status</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300 text-black">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-2 border text-left text-black">Created by</th>
              <th className="px-4 py-2 border text-left text-black">Address</th>
              <th className="px-4 py-2 border text-left text-black">Status</th>
              <th className="px-4 py-2 border text-left text-black">Reserved By</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((account) => (
              <DebugTableRow key={account.publicKey.toString()} account={account.publicKey} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DebugTableRow({ account }: { account: PublicKey }) {
  const { accountQuery } = useMarketplaceProgramAccount({ account });
  
  if (accountQuery.isLoading) {
    return (
      <tr>
        <td className="px-4 py-2 border text-sm font-mono">{ellipsify(account.toString())}</td>
        <td className="px-4 py-2 border text-sm">Loading...</td>
        <td className="px-4 py-2 border text-sm">Loading...</td>
        <td className="px-4 py-2 border text-sm">Loading...</td>
      </tr>
    );
  }
  
  const status = accountQuery.data?.parkingSpaceStatus ? JSON.stringify(accountQuery.data.parkingSpaceStatus) : 'No status';
  const address = accountQuery.data?.address || 'No address';
  const reservedBy = accountQuery.data?.reservedBy ? ellipsify(accountQuery.data.reservedBy.toString()) : 'Not reserved';
  const createdBy = accountQuery.data?.maker ? ellipsify(accountQuery.data.maker.toString()) : 'Unknown';
  
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-4 py-2 border text-sm font-mono">{createdBy}</td>
      <td className="px-4 py-2 border text-sm">{address}</td>
      <td className="px-4 py-2 border text-sm font-mono">{status}</td>
      <td className="px-4 py-2 border text-sm font-mono">{reservedBy}</td>
    </tr>
  );
}

export function ParkingSpaceList() {
  const { accounts, getProgramAccount } = useMarketplaceProgram();
  const { publicKey } = useWallet();
  const [userHasReservations, setUserHasReservations] = useState(false);

  if (getProgramAccount.isLoading) {
    return <span className="loading loading-spinner loading-lg"></span>;
  }
  if (!getProgramAccount.data?.value) {
    return (
      <div className="flex justify-center alert alert-info">
        <span>
          Program account not found. Make sure you have deployed the program and
          are on the correct cluster.
        </span>
      </div>
    );
  }

  // Filter to only show available listings
  const availableAccounts = accounts.data?.filter(account => {
    // We need to check the parking_space_status from the account data
    // For now, we'll show all accounts and let the individual cards handle the status
    return true;
  }) || [];

  // Show wallet connection message if no wallet is connected
  if (!publicKey) {
    return (
      <div className="flex flex-col items-center space-y-6">
        <div className="text-center p-8 bg-gray-800 rounded-lg max-w-md">
          <h2 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h2>
          <p className="text-gray-300 mb-6">
            Please connect your wallet to view and reserve available parking spaces.
          </p>
          <div className="text-sm text-gray-400">
            Available parking spaces will appear here once connected.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-6">
      <DebugTable accounts={availableAccounts} />
      {accounts.isLoading ? (
        <span className="loading loading-spinner loading-lg"></span>
      ) : availableAccounts.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {availableAccounts.map((account) => (
            <ListingCard
              key={account.publicKey.toString()}
              account={account.publicKey}
              userHasReservations={userHasReservations}
              setUserHasReservations={setUserHasReservations}
            />
          ))}
        </div>
      ) : (
        <div className="text-center">
          <h2 className={"text-2xl"}>No listings available</h2>
          <p className="text-gray-600 mt-2">
            {accounts.isLoading ? "Retrieving listings..." : "No parking spaces are currently available for reservation."}
          </p>
        </div>
      )}
    </div>
  );
}

function ListingCard({ account, userHasReservations, setUserHasReservations }: { account: PublicKey; userHasReservations: boolean; setUserHasReservations: (value: boolean) => void }) {
  const { accountQuery, listingsQuery } = useMarketplaceProgramAccount({
    account,
  });
  const { reserve } = useMarketplaceProgram();
  
  // Debug: Compare listingsQuery vs accountQuery data
  if (listingsQuery.data && accountQuery.data) {
    console.log('Data comparison for account:', account.toString(), {
      listingsQueryAddress: listingsQuery.data[0]?.account?.address,
      accountQueryAddress: accountQuery.data?.address,
      listingsQueryStatus: listingsQuery.data[0]?.account?.parkingSpaceStatus,
      accountQueryStatus: accountQuery.data?.parkingSpaceStatus,
      listingsQueryMaker: listingsQuery.data[0]?.account?.maker,
      accountQueryMaker: accountQuery.data?.maker
    });
  }
  const { publicKey } = useWallet();
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  // Helper to convert datetime to unix timestamp
  const toUnixTime = (dateString: string): anchor.BN => {
    if (!dateString) return new anchor.BN(0);
    return new anchor.BN(Math.floor(new Date(dateString).getTime() / 1000));
  };

  const handleReserve = async () => {
    if (!publicKey || !accountQuery.data) return;
    
    // Check if listing is available before attempting to reserve
    const isListingAvailable = accountQuery.data?.parkingSpaceStatus && 
      'available' in accountQuery.data.parkingSpaceStatus;
    
    if (!isListingAvailable) {
      console.error('Cannot reserve: Listing is not available. Status:', accountQuery.data?.parkingSpaceStatus);
      alert('This parking space is not available for reservation.');
      return;
    }

    // Validate that input date/time is within availability window
    if (!startTime || !endTime) {
      alert('Please select both start and end times for your reservation.');
      return;
    }

    const reservationStart = new Date(startTime).getTime() / 1000; // Convert to Unix timestamp
    const reservationEnd = new Date(endTime).getTime() / 1000;
    const listingAvailabilityStart = Number(accountQuery.data.availabiltyStart);
    const listingAvailabilityEnd = Number(accountQuery.data.availabiltyEnd);

    console.log('Availability validation:', {
      reservationStart: new Date(reservationStart * 1000).toISOString(),
      reservationEnd: new Date(reservationEnd * 1000).toISOString(),
      listingAvailabilityStart: new Date(listingAvailabilityStart * 1000).toISOString(),
      listingAvailabilityEnd: new Date(listingAvailabilityEnd * 1000).toISOString()
    });

    // Check if reservation is within availability window
    if (reservationStart < listingAvailabilityStart) {
      alert(`Reservation start time must be after ${new Date(listingAvailabilityStart * 1000).toLocaleString()}`);
      return;
    }

    if (reservationEnd > listingAvailabilityEnd) {
      alert(`Reservation end time must be before ${new Date(listingAvailabilityEnd * 1000).toLocaleString()}`);
      return;
    }

    // Check if reservation duration is valid (end time after start time)
    if (reservationEnd <= reservationStart) {
      alert('Reservation end time must be after start time.');
      return;
    }
    
    console.log('Attempting to reserve listing:', {
      account: account.toString(),
      status: JSON.stringify(accountQuery.data?.parkingSpaceStatus),
      startTime,
      endTime
    });
    
    // Debug: Check if the status matches what the blockchain expects
    console.log('Status debug:', {
      rawStatus: accountQuery.data?.parkingSpaceStatus,
      statusType: typeof accountQuery.data?.parkingSpaceStatus,
      hasAvailable: accountQuery.data?.parkingSpaceStatus && 'available' in accountQuery.data.parkingSpaceStatus,
      statusKeys: accountQuery.data?.parkingSpaceStatus ? Object.keys(accountQuery.data.parkingSpaceStatus) : 'no keys',
      expectedAvailable: 'available',
      actualStatus: accountQuery.data?.parkingSpaceStatus ? Object.keys(accountQuery.data.parkingSpaceStatus)[0] : 'no status'
    });
    
    try {
      await reserve.mutateAsync({
        startTime: toUnixTime(startTime),
        endTime: toUnixTime(endTime),
        renter: publicKey,
        maker: accountQuery.data.maker,
      });
      setUserHasReservations(true);
    } catch (error) {
      console.error('Reservation failed:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        name: error instanceof Error ? error.name : 'Unknown',
        stack: error instanceof Error ? error.stack : 'No stack trace',
        fullError: error
      });
      alert('Reservation failed. Please try again.');
    }
  };

  // Don't render the card if the listing is not available
  // Check if this user has any reservations
  const hasReservation = accountQuery.data?.parkingSpaceStatus && 
    'reserved' in accountQuery.data.parkingSpaceStatus && 
    accountQuery.data.reservedBy?.toString() === publicKey?.toString();
  
  // Check if this listing is available
  const isAvailable = accountQuery.data?.parkingSpaceStatus && 
    'available' in accountQuery.data.parkingSpaceStatus;
  
  // Check if this listing is occupied by the current user
  const isOccupied = accountQuery.data?.parkingSpaceStatus && 
    'occupied' in accountQuery.data.parkingSpaceStatus && 
    accountQuery.data.reservedBy?.toString() === publicKey?.toString();
  
  // Debug: Log the filtering logic
  console.log('Filtering debug for account:', account.toString(), {
    userHasReservations,
    hasReservation,
    isAvailable,
    isOccupied,
    status: accountQuery.data?.parkingSpaceStatus,
    reservedBy: accountQuery.data?.reservedBy?.toString(),
    publicKey: publicKey?.toString(),
    willShow: (userHasReservations && hasReservation) || (!userHasReservations && isAvailable)
  });
  
  // Don't filter while data is loading
  if (accountQuery.isLoading) {
    return null;
  }
  
  // Debug: Log what's happening with filtering
  console.log('Card filtering for account:', account.toString(), {
    userHasReservations,
    hasReservation,
    isOccupied,
    isAvailable,
    willRender: !((userHasReservations || hasReservation) && !hasReservation && !isOccupied) && 
                !(!userHasReservations && !hasReservation && !isAvailable)
  });
  
  // If user has reservations, only show their reserved or occupied listings
  if ((userHasReservations || hasReservation) && !hasReservation && !isOccupied) {
    console.log('Filtering out - not reserved or occupied by user');
    return null;
  }
  
  // If user has no reservations, only show available listings
  if (!userHasReservations && !hasReservation && !isAvailable && !isOccupied) {
    console.log('Filtering out - not available/occupied and user has no reservations');
    return null;
  }
  
  console.log('Card will render for account:', account.toString());

  return listingsQuery.isLoading ? (
    <span className="loading loading-spinner loading-lg"></span>
  ) : (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden mx-auto w-full max-w-md transition-transform transform hover:scale-105">
      {/* Placeholder for an image */}
      <div className="h-48 bg-gray-200 flex items-center justify-center">
        <span className="text-gray-500">Image Placeholder</span>
      </div>
      <div className="p-6">

        <div className="space-y-2">
          <div className="font-medium text-gray-700">
            <span className="font-semibold text-lg">Created by:</span>
            <span className="text-gray-500"> {accountQuery.data?.maker ? ellipsify(accountQuery.data.maker.toString()) : 'Unknown'}</span>
          </div>
          <div className="font-medium text-gray-700">
            <span className="font-semibold text-lg ">Home Address:</span>
            <span className="text-gray-500"> {accountQuery.data?.address}</span>
          </div>
          <div className="font-medium text-gray-700">
            <span className="font-semibold text-lg">Parking Space Status: </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              accountQuery.data?.parkingSpaceStatus && 'available' in accountQuery.data.parkingSpaceStatus 
                ? 'bg-green-100 text-green-800' 
                : accountQuery.data?.parkingSpaceStatus && 'reserved' in accountQuery.data.parkingSpaceStatus
                ? 'bg-yellow-100 text-yellow-800'
                : accountQuery.data?.parkingSpaceStatus && 'occupied' in accountQuery.data.parkingSpaceStatus
                ? 'bg-red-100 text-red-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {accountQuery.data?.parkingSpaceStatus && 'available' in accountQuery.data.parkingSpaceStatus 
                ? 'Available' 
                : accountQuery.data?.parkingSpaceStatus && 'reserved' in accountQuery.data.parkingSpaceStatus
                ? 'Reserved'
                : accountQuery.data?.parkingSpaceStatus && 'occupied' in accountQuery.data.parkingSpaceStatus
                ? 'Occupied'
                : 'Unknown'
              }
            </span>
          </div>
          <div className="font-medium text-gray-700">
            <span className="font-semibold text-xl">Rental Rate:</span>
            <span className="text-gray-500"> {(accountQuery.data?.rentalRate ?? 0)/LAMPORTS_PER_SOL} SOL</span>
          </div>
          <div className="font-medium text-gray-700">
            <span className="font-semibold text-lg">Available From:</span>
            <span className="text-gray-500"> {accountQuery.data?.availabiltyStart ? dayjs.unix(Number(accountQuery.data.availabiltyStart)).format('YYYY-MM-DD HH:mm') : 'N/A'}</span>
          </div>
          <div className="font-medium text-gray-700">
            <span className="font-semibold text-lg">Available Until:</span>
            <span className="text-gray-500"> {accountQuery.data?.availabiltyEnd ? dayjs.unix(Number(accountQuery.data.availabiltyEnd)).format('YYYY-MM-DD HH:mm') : 'N/A'}</span>
          </div>
          <div className="font-medium text-gray-700">
            <span className="font-semibold text-lg ">Additional Info:</span>
            <span className="text-gray-500"> {accountQuery.data?.additionalInfo}</span>
          </div>
          <div className="font-medium text-gray-700">
            <span className="font-semibold text-lg ">Email:</span>
            <span className="text-gray-500"> {accountQuery.data?.email}</span>
          </div>
          <div className="font-medium text-gray-700">
            <span className="font-semibold text-lg ">Phone:</span>
            <span className="text-gray-500"> {accountQuery.data?.phone}</span>
          </div>
        </div>
        {publicKey && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            {hasReservation ? (
              <>
                <h3 className="text-lg font-semibold text-blue-800 mb-3">Your Reservation</h3>
                <div className="mb-3 p-2 bg-green-50 border border-green-200 rounded">
                  <div className="font-medium text-gray-700">
                    <span className="font-semibold text-sm">Total Cost:</span>
                    <span className="text-green-600 font-semibold ml-2">
                      {(() => {
                        const start = accountQuery.data?.reservationStart;
                        const end = accountQuery.data?.reservationEnd;
                        const rate = accountQuery.data?.rentalRate;
                        
                        if (start && end && rate) {
                          const durationHours = (Number(end) - Number(start)) / 3600;
                          const totalCost = (durationHours * Number(rate)) / LAMPORTS_PER_SOL;
                          return `${totalCost.toFixed(4)} SOL`;
                        }
                        return 'Calculating...';
                      })()}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="font-medium text-gray-700">
                    <span className="font-semibold text-sm">Reservation Start:</span>
                    <span className="text-gray-500 ml-2">
                      {accountQuery.data?.reservationStart ? dayjs.unix(Number(accountQuery.data.reservationStart)).format('YYYY-MM-DD HH:mm') : 'N/A'}
                    </span>
                  </div>
                  <div className="font-medium text-gray-700">
                    <span className="font-semibold text-sm">Reservation End:</span>
                    <span className="text-gray-500 ml-2">
                      {accountQuery.data?.reservationEnd ? dayjs.unix(Number(accountQuery.data.reservationEnd)).format('YYYY-MM-DD HH:mm') : 'N/A'}
                    </span>
                  </div>
                  <div className="font-medium text-gray-700">
                    <span className="font-semibold text-sm">Status:</span>
                    <span className="text-green-600 font-semibold ml-2">Reserved</span>
                  </div>
                  <div className="font-medium text-gray-700">
                    <span className="font-semibold text-sm">Reserved by:</span>
                    <span className="text-gray-500 ml-2">
                      {accountQuery.data?.reservedBy ? ellipsify(accountQuery.data.reservedBy.toString()) : 'N/A'}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-lg font-semibold text-blue-800 mb-3">Reservation Duration</h3>
                <div className="space-y-2">
                  <div>
                    <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">
                      Start Time:
                    </label>
                    <input
                      type="datetime-local"
                      id="startTime"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black"
                    />
                  </div>
                  <div>
                    <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">
                      End Time:
                    </label>
                    <input
                      type="datetime-local"
                      id="endTime"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black"
                    />
                  </div>
                </div>
                <button
                  onClick={handleReserve}
                  disabled={!startTime || !endTime || reserve.isPending}
                  className="mt-3 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {reserve.isPending ? "Reserving..." : "Reserve"}
                </button>
              </>
            )}
          </div>
        )}
        {publicKey && hasReservation && (
          <>
            <div className="text-lg font-semibold text-gray-700 mb-2">Step 2: Navigate to Location</div>
            <GpsNavigationButton 
              address={accountQuery.data?.address || ''}
              latitude={accountQuery.data?.latitude || 0}
              longitude={accountQuery.data?.longitude || 0}
            />
            <div className="text-lg font-semibold text-gray-700 mb-2 mt-4">Step 3: Confirm Arrival</div>
            <ConfirmArrivalButton 
              account={account} 
              maker={accountQuery.data?.maker || new PublicKey('11111111111111111111111111111111')}
              sensorId={accountQuery.data?.sensorId || ''}
            />
          </>
        )}
        {/* Debug info for button visibility */}
        <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
          <div>Debug - hasReservation: {hasReservation ? 'true' : 'false'}</div>
          <div>Debug - isOccupied: {isOccupied ? 'true' : 'false'}</div>
          <div>Debug - Status: {JSON.stringify(accountQuery.data?.parkingSpaceStatus)}</div>
          <div>Debug - ReservedBy: {accountQuery.data?.reservedBy?.toString()}</div>
          <div>Debug - PublicKey: {publicKey?.toString()}</div>
        </div>
        
        {/* Debug: Check if we reach the occupied button section */}
        {(() => {
          console.log('Checking occupied button for account:', account.toString(), {
            publicKey: !!publicKey,
            isOccupied,
            willShowButton: publicKey && isOccupied
          });
          return null;
        })()}
        
        {publicKey && isOccupied && (
          <>
            <div className="text-lg font-semibold text-gray-700 mb-2 mt-4">Step 4: Driver Left</div>
            <div className="text-center p-4 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-yellow-800 font-medium">Driver has left the parking space</p>
              <p className="text-yellow-600 text-sm mt-1">The homeowner will simulate the sensor change</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
