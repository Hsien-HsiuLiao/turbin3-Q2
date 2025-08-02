"use client";

import * as anchor from '@coral-xyz/anchor';
import { getMarketplaceProgram, getMarketplaceProgramId } from "../../util/marketplace-exports";
import { AnchorProvider } from '@coral-xyz/anchor';
import { AnchorWallet, useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Cluster, PublicKey } from "@solana/web3.js";
import { useQuery } from "@tanstack/react-query";
import { useCluster } from "../cluster/cluster-data-access";
import { useMemo } from "react";

export function useSensorSimulationProgram() {
  const { connection } = useConnection();
  const { cluster } = useCluster();
  const wallet = useWallet();

  const provider = new AnchorProvider(connection, wallet as AnchorWallet, { commitment: 'confirmed' });

  const programId = useMemo(
    () => getMarketplaceProgramId(cluster.network as Cluster),
    [cluster]
  );
  
  const program = getMarketplaceProgram(provider);

  const accounts = useQuery({
    queryKey: ["sensor-simulation", "all", { cluster }],
    queryFn: () => program.account.listing.all(),
  });

  const getProgramAccount = useQuery({
    queryKey: ["sensor-simulation", "fetch", cluster],
    queryFn: () => program.account.listing.fetch(new PublicKey('11111111111111111111111111111111')),
    enabled: false,
  });

  return {
    program,
    programId,
    accounts,
    getProgramAccount,
  };
} 