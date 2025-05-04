import { fetchMyAnchorProgram, crossbar } from "../";

import { web3, AnchorProvider, Program } from "@coral-xyz/anchor";
import { PullFeed, ON_DEMAND_DEVNET_PID } from "@switchboard-xyz/on-demand";
import {
  useAnchorWallet,
  useConnection,
  useWallet,
} from "@solana/wallet-adapter-react";

// Load the Switchboard Anchor Program
const wallet = useAnchorWallet();
const { connection } = useConnection();
const provider = new AnchorProvider(connection, wallet!);
const sbProgram = await Program.at(ON_DEMAND_DEVNET_PID, provider);

// Replace with your feed pubkey
const feed = new web3.PublicKey("6qmsMwtMmeqMgZEhyLv1Pe4wcqT5iKwJAWnmzmnKjf83");
const feedAccount = new PullFeed(sbProgram, feed);

// If using a wallet adapter of some sort
const { publicKey, sendTransaction } = useWallet();

// Write update to program
const updateFeedAndCallProgram = async () => {
  // Get my custom anchor program
  const demo = await fetchMyAnchorProgram();
  // Instruction to example program using the switchboard feed
  const myIx = await demo.methods
    .test()
    .accounts({feed})
    .instruction();

  // Get the update instruction for switchboard and lookup tables to make the instruction lighter
  const [pullIx, responses, success, luts] = await feedAccount.fetchUpdateIx({
    crossbarClient: crossbar,
  });

  // Set priority fee for that the tx
  const priorityFeeIx = web3.ComputeBudgetProgram.setComputeUnitPrice({
    microLamports: 100_000,
  });

  // Get the latest context
  const {
    context: { slot: minContextSlot },
    value: { blockhash, lastValidBlockHeight },
  } = await connection.getLatestBlockhashAndContext();

  // Get Transaction Message
  const message = new web3.TransactionMessage({
    payerKey: publicKey,
    recentBlockhash: blockhash,
    instructions: [priorityFeeIx, pullIx, myIx],
  }).compileToV0Message(luts);

  // Get Versioned Transaction
  const vtx = new web3.VersionedTransaction(message);
  const signed = await wallet.signTransaction(vtx);

  // Send the transaction via rpc
  const signature = await connection.sendRawTransaction(signed.serialize(), {
    maxRetries: 0,
    skipPreflight: true,
  });

  // Wait for confirmation
  await connection.confirmTransaction({
    signature,
    blockhash,
    lastValidBlockHeight,
  });
};

// ...
