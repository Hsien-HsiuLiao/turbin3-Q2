"use client";

//import { getJournalProgram, getJournalProgramId } from "@journal/anchor";
import {PROGRAM, PROGRAM_ID} from "../../util/const";
import { AnchorProvider } from '@coral-xyz/anchor';
import { AnchorWallet,useConnection ,useWallet} from "@solana/wallet-adapter-react";
//import { useConnect } from '@wallet-ui/react'; //instead of useConnection?

import { Cluster, PublicKey } from "@solana/web3.js";
import { useMutation, useQuery } from "@tanstack/react-query";
//import toast from "react-hot-toast";
import { toast } from 'sonner'

//import { useCluster } from "../cluster/cluster-data-access";
import { useWalletUiCluster } from '@wallet-ui/react';
import { /* useAnchorProvider */SolanaProvider } from "../solana/solana-provider";
//import { useTransactionToast } from "../ui/ui-layout";
import { useTransactionToast } from '../use-transaction-toast'

import { useMemo } from "react";

interface CreateEntryArgs {
  title: string;
  message: string;
  owner: PublicKey;
}

export function useMarketplaceProgram() {
  const { connection } = useConnection();

 // const { cluster } = useCluster();
    const { cluster } = useWalletUiCluster()
  
  const transactionToast = useTransactionToast();
  //const provider = useAnchorProvider();
  //const wallet = useWallet()

  //const provider = new AnchorProvider(connection, wallet as AnchorWallet, { commitment: 'confirmed' })

  const programId = PROGRAM_ID;/* useMemo(
    () => getJournalProgramId(cluster.network as Cluster),
    [cluster]
  ); */
  const program = PROGRAM;//getJournalProgram(provider);

  const accounts = useQuery({
    queryKey: ["listings", "all", { cluster }],
    queryFn: () => program.account.listing.all(),
  });

  const getProgramAccount = useQuery({
    queryKey: ["get-program-account", { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  });

  const createEntry = useMutation<string, Error, CreateEntryArgs>({
    mutationKey: ["journalEntry", "create", { cluster }],
    mutationFn: async ({ title, message }) => {
      return program.methods.createJournalEntry(title, message).rpc();
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
  //  createEntry,
  };
}

/* export function useJournalProgramAccount({ account }: { account: PublicKey }) {
//  const { cluster } = useCluster();
  const { cluster } = useWalletUiCluster()

  const transactionToast = useTransactionToast();
  const { program, accounts } = useJournalProgram();

  const accountQuery = useQuery({
    queryKey: ["journal", "fetch", { cluster, account }],
    queryFn: () => program.account.journalEntryState.fetch(account),
  });

  const updateEntry = useMutation<string, Error, CreateEntryArgs>({
    mutationKey: ["journalEntry", "update", { cluster }],
    mutationFn: async ({ title, message, owner }) => {
      return program.methods.updateJournalEntry(title, message).rpc();
    },
    onSuccess: (signature) => {
      transactionToast(signature);
      accounts.refetch();
    },
    onError: (error) => {
      toast.error(`Failed to update journal entry: ${error.message}`);
    },
  });

  const deleteEntry = useMutation({
    mutationKey: ["journal", "deleteEntry", { cluster, account }],
    mutationFn: (title: string) =>
      program.methods.deleteJournalEntry(title).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx);
      return accounts.refetch();
    },
  });

  return {
    accountQuery,
    updateEntry,
    deleteEntry,
  };
} */