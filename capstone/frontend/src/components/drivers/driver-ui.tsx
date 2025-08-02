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


export function ParkingSpaceList() {
  const { accounts, getProgramAccount } = useMarketplaceProgram();

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

  return (
    <div className="flex flex-col items-center space-y-6">
      {accounts.isLoading ? (
        <span className="loading loading-spinner loading-lg"></span>
      ) : availableAccounts.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {availableAccounts.map((account) => (
            <ListingCard
              key={account.publicKey.toString()}
              account={account.publicKey}
            />
          ))}
        </div>
      ) : (
        <div className="text-center">
          <h2 className={"text-2xl"}>No accounts</h2>
          No accounts found. Create one above to get started.
        </div>
      )}
    </div>
  );
}

function ListingCard({ account }: { account: PublicKey }) {
  const { accountQuery, listingsQuery } = useMarketplaceProgramAccount({
    account,
  });
  const { reserve } = useMarketplaceProgram();
  let listing;

  if (listingsQuery.data) {
    console.log("listingsquery", listingsQuery.data[0].account.address);
    listing = listingsQuery.data[0];
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
    if (!publicKey || !listing) return;
    
    try {
      await reserve.mutateAsync({
        startTime: toUnixTime(startTime),
        endTime: toUnixTime(endTime),
        renter: publicKey,
        maker: listing.account.maker,
      });
    } catch (error) {
      console.error('Reservation failed:', error);
    }
  };

  // Show only the listing that the current user has reserved
  if (!accountQuery.data?.parkingSpaceStatus || 
      !('reserved' in accountQuery.data.parkingSpaceStatus) || 
      accountQuery.data.reservedBy?.toString() !== publicKey?.toString()) {
    return null;
  }

  // return accountQuery.isLoading ? (
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
            <span className="font-semibold text-lg ">Home Address:</span>
            <span className="text-gray-500"> {accountQuery.data?.address}</span>
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
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
