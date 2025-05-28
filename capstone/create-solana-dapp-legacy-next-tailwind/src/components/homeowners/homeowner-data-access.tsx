"use client";

import * as anchor from '@coral-xyz/anchor';

import { getMarketplaceProgram, getMarketplaceProgramId } from "../../util/marketplace-exports";
//import { PROGRAM, PROGRAM_ID } from "../../util/const";
import { AnchorProvider } from '@coral-xyz/anchor';
import { AnchorWallet, useConnection, useWallet } from "@solana/wallet-adapter-react";
//import { useConnect } from '@wallet-ui/react'; //instead of useConnection?

import { Cluster, PublicKey } from "@solana/web3.js";
import { useMutation, useQuery } from "@tanstack/react-query";
//import toast from "react-hot-toast";
import { toast } from 'sonner'

import { useCluster } from "../cluster/cluster-data-access";
//import { UiWalletAccount, useWalletUiCluster } from '@wallet-ui/react';
import { /* useAnchorProvider */SolanaProvider } from "../solana/solana-provider";
//import { useTransactionToast } from "../ui/ui-layout";
import { useTransactionToast } from '../use-transaction-toast'

import { useMemo } from "react";

interface CreateListingArgs {
    address: string;              // Address (String)
    rentalRate: number;           // Rental rate (u32)
    sensorId: string;             // Sensor ID (String)
    latitude: number;             // Latitude (f64)
    longitude: number;            // Longitude (f64)
    additionalInfo?: string;      // Additional information (Option<String>)
    availabilityStart: anchor.BN;    // Availability start (i64)
    availabilityEnd: anchor.BN;      // Availability end (i64)
    email: string;                // Email (String)
    phone: string;
    homeowner1: PublicKey;

}



export function useMarketplaceProgram() {
    const { connection } = useConnection();

    const { cluster } = useCluster();
   // const { cluster } = useWalletUiCluster()

    const transactionToast = useTransactionToast();
    //const provider = useAnchorProvider();
    const wallet = useWallet()

    const provider = new AnchorProvider(connection, wallet as AnchorWallet, { commitment: 'confirmed' })

    const programId = useMemo(
    () => getMarketplaceProgramId(cluster.network as Cluster),
    [cluster]
  );
    const program = getMarketplaceProgram(provider);

    program

    const accounts = useQuery({
        queryKey: ["listings", "all", { cluster }],
        queryFn: () => program.account.listing.all(),
    });

    console.log("accounts", accounts);

    const getProgramAccount = useQuery({
        queryKey: ["get-program-account", { cluster }],
        queryFn: () => connection.getParsedAccountInfo(programId),
    });

    const marketplace_name = "DePIN PANORAMA PARKING";

    let marketplace: PublicKey;
    let marketplaceBump;
    
    [marketplace, marketplaceBump] = PublicKey.findProgramAddressSync(
      [Buffer.from("marketplace"), Buffer.from(marketplace_name)],
      program.programId
    );

    const createListing = useMutation<string, Error, CreateListingArgs>({
        mutationKey: ["journalEntry", "create", { cluster }],
        mutationFn: async ({address,
            rentalRate,
            sensorId,
            latitude,
            longitude,
            additionalInfo,
            availabilityStart,
            availabilityEnd,
            email,
            phone,
        homeowner1}) => {
          console.log({
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
            homeowner1
        });

        console.log("Marketplace PublicKey:", marketplace);
console.log("Homeowner PublicKey:", homeowner1);
                const listingPDA = PublicKey.findProgramAddressSync(
                    [marketplace.toBuffer(), homeowner1.toBuffer()],
                    program.programId
                  )[0];
            return  program.methods.list(
                address,            // string
                rentalRate,         // number
                sensorId,           // string
                latitude,           // number
                longitude,          // number
                additionalInfo ?? null,     // string (optional)
                availabilityStart,   // number (i64)
                availabilityEnd,     // number (i64)
                email,              // string
                phone,                 // string
                
            )
            .accountsPartial({
               // maker: homeowner1,
                marketplace: marketplace,
                //     listing: listing
              })
            //  .signers([homeowner1])
            .rpc();
    },
        onSuccess: (signature) => {
            transactionToast(signature);
            accounts.refetch();
        },
        onError: (error) => {
            toast.error(`Failed to create journal entry: ${error.message}`);
        },
  });

return {
    program,
    programId,
    accounts,
    getProgramAccount,
    createListing
};
}

//export function useJournalProgramAccount({ account }: { account: PublicKey }) {
  export function useMarketplaceProgramAccount({ account }: { account: PublicKey }) {

  const { cluster } = useCluster();
//  const { cluster } = useWalletUiCluster()

  const transactionToast = useTransactionToast();
 // const { program, accounts } = useJournalProgram();
  const { program, accounts } = useMarketplaceProgram();


  const accountQuery = useQuery({
    queryKey: ["journal", "fetch", { cluster, account }],
    queryFn: () => program.account.listing.fetch(account),
  });

  const marketplace_name = "DePIN PANORAMA PARKING";

let marketplace: PublicKey;
let marketplaceBump;

[marketplace, marketplaceBump] = PublicKey.findProgramAddressSync(
  [Buffer.from("marketplace"), Buffer.from(marketplace_name)],
  program.programId
);





 // const updateEntry = useMutation<string, Error, CreateEntryArgs>({
    const updateListing = useMutation<string, Error, CreateListingArgs>({

    mutationKey: ["journalEntry", "update", { cluster }],
    mutationFn: async ({
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
  homeowner1}) => {
    const listingPDA = PublicKey.findProgramAddressSync(
      [marketplace.toBuffer(), homeowner1.toBuffer()],
      program.programId
    )[0];

    const listing = PublicKey.findProgramAddressSync(
      [marketplace.toBuffer(), homeowner1.toBuffer()],
      program.programId
    )[0];

      return program.methods.updateListing( address,            // string
        rentalRate,         // number
        sensorId,           // string
        latitude,           // number
        longitude,          // number
        additionalInfo ?? null,     // string (optional)
        availabilityStart,   // number (i64)
        availabilityEnd,     // number (i64)
        email,              // string
        phone,                 // string
        )
        .accountsPartial({
           maker: homeowner1,
           marketplace: marketplace,
                listing: listing
         })
         .rpc();
    },
    onSuccess: (signature) => {
      transactionToast(signature);
      accounts.refetch();
    },
    onError: (error) => {
      toast.error(`Failed to update listing: ${error.message}`);
    },
  });

  const deleteListing = useMutation({
    mutationKey: ["journal", "deleteEntry", { cluster, account }],
    mutationFn: (homeowner1) =>
      program.methods.deleteListing()
    .accountsPartial({
      maker: homeowner1, //
      marketplace: marketplace,
     // listing: listing,
      owner: homeowner1 //
    })
    .rpc(),
    onSuccess: (tx) => {
      transactionToast(tx);
      return accounts.refetch();
    },
  });

  return {
    accountQuery,
    updateListing,
    deleteListing,
  };
}