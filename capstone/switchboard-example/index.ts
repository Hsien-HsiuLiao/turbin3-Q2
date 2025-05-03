
import {
  AnchorUtils,
  PullFeed,
  getDefaultQueue,
  getDefaultDevnetQueue,
  asV0Tx,
} from "@switchboard-xyz/on-demand";
import { CrossbarClient, OracleJob } from "@switchboard-xyz/common";
//import wallet from "./HTurbin3-wallet.json"



const jobs: OracleJob[] = [
    // @ts-ignore
  new OracleJob({
    tasks: [
      {
        httpTask: {
          url: "https://depin-parking.vercel.app/api/mock-driver-arrived",
        }
      },
      {
        jsonParseTask: {
          path: "$[0].distance_in_cm"
        }
      }
    ],
  }),
];
console.log("Running simulation...\n");

// Print the jobs that are being run.
const jobJson = JSON.stringify({ jobs: jobs.map((job) => job.toJSON()) });
console.log(jobJson);
console.log();

// Serialize the jobs to base64 strings.
const serializedJobs = jobs.map((oracleJob) => {
  const encoded = OracleJob.encodeDelimited(oracleJob).finish();
  const base64 = Buffer.from(encoded).toString("base64");
  return base64;
});

// Call the simulation server.
const response = await fetch("https://api.switchboard.xyz/api/simulate", {
  method: "POST",
  headers: [["Content-Type", "application/json"]],
  body: JSON.stringify({ cluster: "Mainnet", jobs: serializedJobs }),
//  body: JSON.stringify({ cluster: "Devnet", jobs: serializedJobs }),

});

/* // Log the response from the simulation server
const responseData = await response.json();
console.log(`Response from simulation server:`, responseData); */

// Check response.
if (response.ok) {
  const data = await response.json();
  console.log(`Response is good (${response.status})`);
  console.log(JSON.stringify(data, null, 2));
} else {
  console.log(`Response is bad (${response.status})`);
  console.log(await response.text());
}

console.log("Storing and creating the feed...\n");

const solanaRpcUrl = "https://turbine-solanad-4cde.devnet.rpcpool.com/168dd64f-ce5e-4e19-a836-f6482ad6b396";
// Get the queue for the network you're deploying on
let queue = await getDefaultDevnetQueue(solanaRpcUrl);

// Get the default crossbar server client
const crossbarClient = CrossbarClient.default();

// Upload jobs to Crossbar, which pins valid feeds on ipfs
// Feeds are associated with a specific queue, which is why we need to pass it in
const { feedHash } = await crossbarClient.store(queue.pubkey.toBase58(), jobs);

// Get the payer keypair
const payer = await AnchorUtils.initKeypairFromFile(
  "./HTurbin3-wallet.json"
);
console.log("Using Payer:", payer.publicKey.toBase58(), "\n");

const [pullFeed, feedKeypair] = PullFeed.generate(queue.program);

// Get the initialization for the pull feeds
const ix = await pullFeed.initIx({
  name: "DS20L mock sensor data", // the feed name (max 32 bytes)
  queue: queue.pubkey, // the queue of oracles to bind to
  maxVariance: 1.0, // the maximum variance allowed for the feed results
  minResponses: 1, // minimum number of responses of jobs to allow
  feedHash: Buffer.from(feedHash.slice(2), "hex"), // the feed hash
  minSampleSize: 1, // The minimum number of samples required for setting feed value
  maxStaleness: 60, // The maximum number of slots that can pass before a feed value is considered stale.
  payer: payer.publicKey, // the payer of the feed
});

// Generate VersionedTransaction
const tx = await asV0Tx({
  connection: queue.program.provider.connection,
  ixs: [ix],
  payer: payer.publicKey,
  signers: [payer, feedKeypair],
  computeUnitPrice: 75_000,
  computeUnitLimitMultiple: 1.3,
});

// Simulate the transaction
const simulateResult = await queue.program.provider.connection.simulateTransaction(tx, {
  commitment: "processed",
});
console.log(simulateResult);

// Send transaction to validator
const sig = await queue.program.provider.connection.sendTransaction(tx, {
  preflightCommitment: "processed",
  skipPreflight: true,
});

// Finished!
console.log(`Feed ${feedKeypair.publicKey} initialized: ${sig}`);

//confim tx
import { Connection, clusterApiUrl, type TransactionConfirmationStrategy } from '@solana/web3.js';

// Create a connection to the Solana cluster
const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

// Function to confirm a transaction
async function confirmTransaction(signature: string) {
  try {
    // Wait for the transaction to be confirmed
    const confirmation = await connection.confirmTransaction(signature, 'confirmed');
    
    if (confirmation.value.err) {
      console.error('Transaction failed:', confirmation.value.err);
    } else {
      console.log('Transaction confirmed:', signature);
    }
  } catch (error) {
    console.error('Error confirming transaction:', error);
  }
}

//const transactionSignature = 'YOUR_TRANSACTION_SIGNATURE_HERE';
console.log("confirming");
await confirmTransaction(sig);


//request from oracle

const feedConnection = pullFeed.program.provider.connection;

const [pullIx, responses, _, luts] = await pullFeed.fetchUpdateIx({
  crossbarClient: crossbarClient,
  chain: "solana",
  //network: "mainnet",
  network: "devnet",

});

const pullTx = await asV0Tx({
  connection: feedConnection,
  ixs: pullIx!, // after the pullIx you can add whatever transactions you'd like
  signers: [payer],
  computeUnitPrice: 200_000,
  computeUnitLimitMultiple: 1.3,
  lookupTables: luts,
});

// simulate and send
const sim = await feedConnection.simulateTransaction(pullTx, {
  commitment: "processed",
});
const pullSig = await feedConnection.sendTransaction(tx, {
  preflightCommitment: "processed",
  skipPreflight: true,
});
if (sim.value?.logs) {
  const simPrice = sim.value.logs.join().match(/distance_in_cm: (.*)/)[1];
  console.log(`Price update: ${simPrice}\n\tTransaction sent: ${pullSig}`);
} else {
  console.log("No price update");
}