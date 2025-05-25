import * as sb from "@switchboard-xyz/on-demand";
import { TX_CONFIG, myAnchorProgram, sleep } from "./utils";
import { PublicKey } from "@solana/web3.js";





(async function main() {
  const { keypair, connection, program } = await sb.AnchorUtils.loadEnv();
  const feed = new PublicKey("J748azokS8cKaiGKgN5hsTsTuB1FJ1ikVNXKjq9DQnjg");
  const feedAccount = new sb.PullFeed(program!, feed);
  await feedAccount.preHeatLuts();
  const latencies: number[] = [];
  
  const myProgramPath = "target/deploy/sb_on_demand_solana-keypair.json";
  const myProgram = await myAnchorProgram(program!.provider, myProgramPath);
  console.log("myProgram", myProgram?.methods);


  while (true) {
    const start = Date.now();
    const [pullIx, responses, _ok, luts] = await feedAccount.fetchUpdateIx({
      numSignatures: 3,
    });
    //added
    // Instruction to example program using the switchboard feed
   // console.log("methods", await program?.methods);
    const myIx = await myProgram!.methods
    .test()
    .accounts({feed}) //account name must match
    .instruction();
    const endTime = Date.now();
    for (const response of responses) {
      const shortErr = response.shortError();
      if (shortErr) {
        console.log(`Error: ${shortErr}`);
      }
    }
    const tx = await sb.asV0Tx({
      connection,
      ixs: [...pullIx!, myIx],
      signers: [keypair],
      computeUnitPrice: 200_000,
      computeUnitLimitMultiple: 1.3,
      lookupTables: luts,
    });

    const sim = await connection.simulateTransaction(tx, TX_CONFIG);
    const updateEvent = new sb.PullFeedValueEvent(
      sb.AnchorUtils.loggedEvents(program!, sim.value.logs!)[0]
    ).toRows();
    console.log("Simulated Price Updates:\n", JSON.stringify(sim.value.logs));
    console.log("Submitted Price Updates:\n", updateEvent);
    const latency = endTime - start;
    latencies.push(latency);


    console.log(`Transaction sent: ${await connection.sendTransaction(tx)}`);
    console.log(`Looping...`);

    await sleep(3000);
  }
})();
