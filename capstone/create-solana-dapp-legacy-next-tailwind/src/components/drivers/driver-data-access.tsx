"use client";

import * as anchor from '@coral-xyz/anchor';

import { getMarketplaceProgram, getMarketplaceProgramId } from "../../util/marketplace-exports";
import { AnchorProvider } from '@coral-xyz/anchor';
import { AnchorWallet, useConnection, useWallet } from "@solana/wallet-adapter-react";

import { Cluster, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { useMutation, useQuery } from "@tanstack/react-query";
//import toast from "react-hot-toast";
import { toast } from 'sonner'

import { useCluster } from "../cluster/cluster-data-access";
import { /* useAnchorProvider */SolanaProvider } from "../solana/solana-provider";
import { useTransactionToast } from '../use-transaction-toast'

import { useMemo } from "react";



export function useMarketplaceProgram() {
    const { connection } = useConnection();

    const { cluster } = useCluster();

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

   // console.log("accounts", accounts);

    const getProgramAccount = useQuery({
        queryKey: ["get-program-account", { cluster }],
        queryFn: () => connection.getParsedAccountInfo(programId),
    });

   
    
    

return {
    program,
    programId,
    accounts,
    getProgramAccount,
    
};
}

  export function useMarketplaceProgramAccount({ account }: { account: PublicKey }) {

  const { cluster } = useCluster();

  const transactionToast = useTransactionToast();
  const { program, accounts } = useMarketplaceProgram();


  const accountQuery = useQuery({
    queryKey: ["journal", "fetch", { cluster, account }],
    queryFn: () => program.account.listing.fetch(account),
  });

  //instead of fetching account, need to fetch all marketpalce listings
  //    const listings = await program.account.listing.all();
  const listingsQuery = useQuery({
    queryKey: ["listings", "fetch", { cluster, account }],
    queryFn: () => program.account.listing.all(),
  });

  const marketplace_name = "DePIN PANORAMA PARKING";

let marketplace: PublicKey;
let marketplaceBump;

[marketplace, marketplaceBump] = PublicKey.findProgramAddressSync(
  [Buffer.from("marketplace"), Buffer.from(marketplace_name)],
  program.programId
);




  return {
    accountQuery,
    listingsQuery
    
  };
}