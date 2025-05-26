"use client";

import { Keypair, PublicKey } from "@solana/web3.js";
// import { useMemo } from 'react';
import { ellipsify } from '@/lib/utils'
import { ExplorerLink } from "../cluster/cluster-ui";
import {

    useMarketplaceProgram
    //useJournalProgramAccount,
} from "./homeowner-data-access";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletUi } from '@wallet-ui/react';

import { useState } from "react";

export function ListingCreate() {
    const { createListing } = useMarketplaceProgram();
  //   const { publicKey } = useWallet();
    const { account } = useWalletUi();

    const [address, setAddress] = useState("");              // Address (String)
    const [rentalRate, setRentalRate] = useState(0);        // Rental rate (u32)
    const [sensorId, setSensorId] = useState("");            // Sensor ID (String)
    const [latitude, setLatitude] = useState(0);             // Latitude (f64)
    const [longitude, setLongitude] = useState(0);           // Longitude (f64)
    const [additionalInfo, setAdditionalInfo] = useState(""); // Additional information (Option<String>)
    const [availabilityStart, setAvailabilityStart] = useState(0); // Availability start (i64)
    const [availabilityEnd, setAvailabilityEnd] = useState(0);     // Availability end (i64)
    const [email, setEmail] = useState("");                  // Email (String)
    const [phone, setPhone] = useState("");                  // Phone (String)

    const isFormValid =
        address.trim() !== "" &&
        rentalRate > 0 && // Assuming rentalRate should be greater than 0
        sensorId.trim() !== "" &&
        latitude !== 0 && // Assuming latitude should not be 0 (or you can adjust this based on your requirements)
        longitude !== 0 && // Assuming longitude should not be 0 (or you can adjust this based on your requirements)
        additionalInfo.trim() !== "" && // Optional, but you can check if it's not empty if needed
        availabilityStart > 0 && // Assuming availabilityStart should be a positive number
        availabilityEnd > 0 && // Assuming availabilityEnd should be a positive number
        email.trim() !== "" &&
        phone.trim() !== "";

    const handleSubmit = async () => {
        if (account && isFormValid) {
            await createListing.mutateAsync({
                address,
                rentalRate,
                sensorId,
                latitude,
                longitude,
                additionalInfo,
                availabilityStart,
                availabilityEnd,
                email,
                phone,
                homeowner1: account
            });
        }
    };

    if (!account) {
        return <p>Connect your wallet</p>;
    }

    return (
        <div>
            <label htmlFor="address" className="block text-sm font-medium text-white">
    Home Address to rent out
</label>
<input
    type="text"
    id="address"
    placeholder="Home Address to rent out"
    value={address}
    onChange={(e) => setAddress(e.target.value)}
    className="input input-bordered w-full max-w-xs border border-white" // Added border class
/>

<label htmlFor="rentalRate" className="block text-sm font-medium text-white">
    Rental Rate
</label>
<input
    type="number"
    id="rentalRate"
    placeholder="Rental Rate"
    value={rentalRate}
    onChange={(e) => setRentalRate(Number(e.target.value))} // Convert to number
    className="input input-bordered w-full max-w-xs border border-white" // Added border class
/>

<label htmlFor="sensorId" className="block text-sm font-medium text-white">
    Sensor ID
</label>
<input
    type="text"
    id="sensorId"
    placeholder="Sensor ID"
    value={sensorId}
    onChange={(e) => setSensorId(e.target.value)}
    className="input input-bordered w-full max-w-xs border border-white" // Added border class
/>

<label htmlFor="latitude" className="block text-sm font-medium text-white">
    Latitude
</label>
<input
    type="number"
    id="latitude"
    placeholder="Latitude"
    value={latitude}
    onChange={(e) => setLatitude(Number(e.target.value))} // Convert to number
    className="input input-bordered w-full max-w-xs border border-white" // Added border class
/>

<label htmlFor="longitude" className="block text-sm font-medium text-white">
    Longitude
</label>
<input
    type="number"
    id="longitude"
    placeholder="Longitude"
    value={longitude}
    onChange={(e) => setLongitude(Number(e.target.value))} // Convert to number
    className="input input-bordered w-full max-w-xs border border-white" // Added border class
/>

<label htmlFor="additionalInfo" className="block text-sm font-medium text-white">
    Additional Info
</label>
<textarea
    id="additionalInfo"
    placeholder="Additional Info"
    value={additionalInfo}
    onChange={(e) => setAdditionalInfo(e.target.value)}
    className="textarea textarea-bordered w-full max-w-xs border border-white" // Added border class
/>

<label htmlFor="availabilityStart" className="block text-sm font-medium text-white">
    Availability Start
</label>
<input
    type="number"
    id="availabilityStart"
    placeholder="Availability Start"
    value={availabilityStart}
    onChange={(e) => setAvailabilityStart(Number(e.target.value))} // Convert to number
    className="input input-bordered w-full max-w-xs border border-white" // Added border class
/>

<label htmlFor="availabilityEnd" className="block text-sm font-medium text-white">
    Availability End
</label>
<input
    type="number"
    id="availabilityEnd"
    placeholder="Availability End"
    value={availabilityEnd}
    onChange={(e) => setAvailabilityEnd(Number(e.target.value))} // Convert to number
    className="input input-bordered w-full max-w-xs border border-white" // Added border class
/>

<label htmlFor="email" className="block text-sm font-medium text-white">
    Email
</label>
<input
    type="email"
    id="email"
    placeholder="Email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    className="input input-bordered w-full max-w-xs border border-white" // Added border class
/>
<label htmlFor="phone" className="block text-sm font-medium text-white">
    Phone
</label>
<input
    type="tel"
    id="phone"
    placeholder="Phone"
    value={phone}
    onChange={(e) => setPhone(e.target.value)}
    className="input input-bordered w-full max-w-xs border border-white" // Added border class
/>

            <br></br>
            <button
                className="btn btn-xs lg:btn-md btn-primary"
                onClick={handleSubmit}
                disabled={createListing.isPending || !isFormValid}
            >
                Create A Listing {createListing.isPending && "..."}
            </button>
        </div>
    );
}

/* export function JournalList() {
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
    <div className={"space-y-6"}>
      {accounts.isLoading ? (
        <span className="loading loading-spinner loading-lg"></span>
      ) : accounts.data?.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {accounts.data?.map((account) => (
            <JournalCard
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
} */

/* function JournalCard({ account }: { account: PublicKey }) {
  const { accountQuery, updateEntry, deleteEntry } = useJournalProgramAccount({
    account,
  });
  const { publicKey } = useWallet();
  const [message, setMessage] = useState("");
  const title = accountQuery.data?.title;

  const isFormValid = message.trim() !== "";

  const handleSubmit = () => {
    if (publicKey && isFormValid && title) {
      updateEntry.mutateAsync({ title, message, owner: publicKey });
    }
  };

  if (!publicKey) {
    return <p>Connect your wallet</p>;
  }

  return accountQuery.isLoading ? (
    <span className="loading loading-spinner loading-lg"></span>
  ) : (
    <div className="card card-bordered border-base-300 border-4 text-neutral-content">
      <div className="card-body items-center text-center">
        <div className="space-y-6">
          <h2
            className="card-title justify-center text-3xl cursor-pointer"
            onClick={() => accountQuery.refetch()}
          >
            {accountQuery.data?.title}
          </h2>
          <p>{accountQuery.data?.message}</p>
          <div className="card-actions justify-around">
            <textarea
              placeholder="Update message here"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="textarea textarea-bordered w-full max-w-xs"
            />
            <button
              className="btn btn-xs lg:btn-md btn-primary"
              onClick={handleSubmit}
              disabled={updateEntry.isPending || !isFormValid}
            >
              Update Journal Entry {updateEntry.isPending && "..."}
            </button>
          </div>
          <div className="text-center space-y-4">
            <p>
              <ExplorerLink
                path={`account/${account}`}
                label={ellipsify(account.toString())}
              />
            </p>
            <button
              className="btn btn-xs btn-secondary btn-outline"
              onClick={() => {
                if (
                  !window.confirm(
                    "Are you sure you want to close this account?"
                  )
                ) {
                  return;
                }
                const title = accountQuery.data?.title;
                if (title) {
                  return deleteEntry.mutateAsync(title);
                }
              }}
              disabled={deleteEntry.isPending}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} */