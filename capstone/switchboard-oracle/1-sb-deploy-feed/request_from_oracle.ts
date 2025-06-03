//after running index.ts

// Extended from Part 2
import {
    AnchorUtils,
    PullFeed,
    getDefaultQueue,
    getDefaultDevnetQueue,
    asV0Tx,
  } from "@switchboard-xyz/on-demand";
  
// Get the payer keypair
const payer = await AnchorUtils.initKeypairFromFile(
  "./HTurbin3-wallet.json"
);

const connection = pullFeed.program.provider.connection;

const [pullIx, responses, _, luts] = await pullFeed.fetchUpdateIx({
  crossbarClient: crossbarClient,
  chain: "solana",
  network: "mainnet",
});

const tx = await asV0Tx({
  connection,
  ixs: [pullIx!], // after the pullIx you can add whatever transactions you'd like
  signers: [payer],
  computeUnitPrice: 200_000,
  computeUnitLimitMultiple: 1.3,
  lookupTables: luts,
});

// simulate and send
const sim = await connection.simulateTransaction(tx, {
  commitment: "processed",
});
const sig = await connection.sendTransaction(tx, {
  preflightCommitment: "processed",
  skipPreflight: true,
});
if (sim.value?.logs) {
  const simPrice = sim.value.logs.join().match(/price: (.*)/)[1];
  console.log(`Price update: ${simPrice}\n\tTransaction sent: ${sig}`);
} else {
  console.log("No price update");
}