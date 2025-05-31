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
  return (
    <div className="flex flex-col items-center space-y-6">
      {accounts.isLoading ? (
        <span className="loading loading-spinner loading-lg"></span>
      ) : accounts.data?.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {accounts.data?.map((account) => (
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
  let listing;

  if (listingsQuery.data) {
    console.log("listingsquery", listingsQuery.data[0].account.address);
    listing = listingsQuery.data[0];

  }
  const { publicKey } = useWallet();

  /* if (!publicKey) {
    return <p className="text-center">Connect your wallet</p>;
  } */

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
          <div className="text-lg font-medium text-gray-700">
            <span className="font-semibold">Home Address:</span>
            <span className="text-gray-500"> {listing?.account.address}</span>
            {/*             <span className="text-gray-500"> {listingsQuery.data?.}</span>
 */}          </div>
          <div className="text-lg font-medium text-gray-700">
            <span className="font-semibold">Rental Rate:</span>
            <span className="text-gray-500"> {listing?.account.rentalRate} SOL</span>
          </div>
          <div className="text-lg font-medium text-gray-700">
            <span className="font-semibold">Sensor ID:</span>
            <span className="text-gray-500"> {listing?.account.sensorId}</span>
          </div>
          <div className="text-lg font-medium text-gray-700">
            <span className="font-semibold">Latitude:</span>
            <span className="text-gray-500"> {listing?.account.latitude}</span>
          </div>
          <div className="text-lg font-medium text-gray-700">
            <span className="font-semibold">Longitude:</span>
            <span className="text-gray-500"> {listing?.account.longitude}</span>
          </div>
          <div className="text-lg font-medium text-gray-700">
            <span className="font-semibold">Additional Info:</span>
            <span className="text-gray-500"> {listing?.account.additionalInfo}</span>
          </div>
          <div className="text-lg font-medium text-gray-700">
            <span className="font-semibold">Email:</span>
            <span className="text-gray-500"> {listing?.account.email}</span>
          </div>
          <div className="text-lg font-medium text-gray-700">
            <span className="font-semibold">Phone:</span>
            <span className="text-gray-500"> {listing?.account.phone}</span>
          </div>
        </div>
        <div className="mt-4">
        {publicKey ? (
      <button
        className="w-full bg-green-500 text-white font-semibold py-2 rounded-lg shadow-md hover:bg-green-600 transition duration-200"
        onClick={() => {
          // Handle reservation logic here
          alert(`Reserved`);
        }}
      >
        Reserve
      </button>
    ) : (
      <button
        className="w-full bg-blue-500 text-white font-semibold py-2 rounded-lg shadow-md hover:bg-blue-600 transition duration-200"
        onClick={() => {
          // Handle wallet connection logic here
          alert(`Connect your wallet`);
        }}
      >
        Connect Wallet to reserve
      </button>
    )}
        </div>
      </div>
    </div>
  );
}
