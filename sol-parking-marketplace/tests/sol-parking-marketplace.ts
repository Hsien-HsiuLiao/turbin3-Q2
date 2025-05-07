import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Marketplace } from "../target/types/marketplace";
import {
  Commitment,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
/* import {
  getMinimumBalanceForRentExemptAccount, 
} from "@solana/spl-token"; */
import * as sb from "@switchboard-xyz/on-demand";
import { assert } from "chai";


describe("depin parking space marketplace", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const provider = anchor.getProvider();

  const connection = provider.connection;


  const program = anchor.workspace.marketplace as Program<Marketplace>;
  const programId = program.programId;

  //helpers
  const confirm = async (signature: string): Promise<string> => {
    const block = await connection.getLatestBlockhash();
    await connection.confirmTransaction({
      signature,
      ...block,
    });
    return signature;
  };

  const log = async (signature: string): Promise<string> => {
    console.log(
      `Your transaction signature: https://explorer.solana.com/transaction/${signature}?cluster=custom&customUrl=${connection.rpcEndpoint}`
    );
    return signature;
  };

  //get/find accounts
  //, listing, owner, feed
  const [admin, homeowner1, homeowner2, homeowner3, renter] = Array.from({ length: 5 }, () =>
    Keypair.generate()
  );

  const marketplace_name = "DePIN PARKING";

  let marketplace: PublicKey;
  let marketplaceBump;


  [marketplace, marketplaceBump] = PublicKey.findProgramAddressSync(
    [Buffer.from("marketplace"), Buffer.from(marketplace_name)],
    program.programId
  );

  //const sensorId = "A9";

  // console.log("maketplace", marketplace);

  /* const listing = PublicKey.findProgramAddressSync(
    [marketplace.toBuffer(), Buffer.from(sensorId)],
    program.programId
  )[0];

  console.log("listing", listing);
 */

  it("Airdrop", async () => {
    //  console.log("maker", maker.publicKey);
    //console.log("renter", renter.publicKey);
    const homeowner1Tx = await connection.requestAirdrop(homeowner1.publicKey, 2 * LAMPORTS_PER_SOL);
    const homeowner2Tx = await connection.requestAirdrop(homeowner2.publicKey, 2 * LAMPORTS_PER_SOL);
    const homeowner3Tx = await connection.requestAirdrop(homeowner3.publicKey, 2 * LAMPORTS_PER_SOL);

    const renterTx = await connection.requestAirdrop(renter.publicKey, 2 * LAMPORTS_PER_SOL);
    const adminTX = await connection.requestAirdrop(admin.publicKey, 2 * LAMPORTS_PER_SOL);

    // , confirm the airdrop transactions
    await connection.confirmTransaction(homeowner1Tx);
    await connection.confirmTransaction(homeowner2Tx);
    await connection.confirmTransaction(homeowner3Tx);


    await connection.confirmTransaction(renterTx);
    await connection.confirmTransaction(adminTX);

    // Log the balance of each keypair
    const balance1 = await connection.getBalance(homeowner1.publicKey);
    //  console.log(`Balance for maker: ${balance1 / LAMPORTS_PER_SOL} SOL`);

    const balance2 = await connection.getBalance(renter.publicKey);
    //  console.log(`Balance for renter: ${balance2 / LAMPORTS_PER_SOL} SOL`);
   // let tx = new Transaction();
    /*  tx.instructions = [
       ...[homeowner1, renter].map((account) =>
         SystemProgram.transfer({
           fromPubkey: provider.publicKey,
           toPubkey: account.publicKey,
           lamports: 10 * LAMPORTS_PER_SOL,
         })
       ),
      
       
       
     ]; */

    //  await provider.sendAndConfirm(tx, [maker]).then(log);
  });


  it("Is initialized!", async () => {
    // Add your test here.
    const rental_fee = 0.015 * LAMPORTS_PER_SOL;
    const tx = await program.methods
      .initialize(marketplace_name, rental_fee,)
      .accountsPartial({
        admin: admin.publicKey,
        marketplace: marketplace,
      })
      .signers([admin])
      .rpc()
      .then(confirm)
      .then(log);
    console.log("Your transaction signature", tx);
  });

  it("Create new listings for parking space rental", async () => {
    let address = "1234 MyStreet, Los Angeles, CA 90210";
    let rentalRate = 0.0345 * LAMPORTS_PER_SOL; //$5 USD/hr ~ 0.0345 SOL 
    let sensorId = "A946444646";
    let additional_info ="gate code is 2342";

    //[latitude, longitude] =getLatLon(address);
    let latitude;
    let longitude;
    [latitude, longitude] = [34.2273574, -118.4500036];

    await program.methods
      .list(address, rentalRate, sensorId, latitude, longitude, additional_info)
      .accountsPartial({
        maker: homeowner1.publicKey,
        marketplace: marketplace,
        //     listing: listing
      })
      //    .then(console.log("accountspartial"))
      .signers([homeowner1])
      // .then()
      .rpc()
      .then(confirm)
      .then(log);

    const listing = PublicKey.findProgramAddressSync(
      [marketplace.toBuffer(), homeowner1.publicKey.toBuffer()],
      program.programId
    )[0];

    const listingAccountInfo = await connection.getAccountInfo(listing);

    assert(listingAccountInfo !== null);

    // homeowner2 creates a  listing
    address = "1235 MyStreet, Los Angeles, CA 90210";
    rentalRate = 0.0355 * LAMPORTS_PER_SOL; //$5 USD/hr ~ 0.0345 SOL 
    sensorId = "B946444646";
    additional_info= "";
    //[latitude, longitude] =getLatLon(address);

    [latitude, longitude] = [35.2273574, -118.4500036];

    await program.methods
      .list(address, rentalRate, sensorId, latitude, longitude, additional_info)
      .accountsPartial({
        maker: homeowner2.publicKey,
        marketplace: marketplace,
        //     listing: listing
      })
      //    .then(console.log("accountspartial"))
      .signers([homeowner2])
      // .then()
      .rpc()
      .then(confirm)
      .then(log);

    const listing2 = PublicKey.findProgramAddressSync(
      [marketplace.toBuffer(), homeowner2.publicKey.toBuffer()],
      program.programId
    )[0];

    const listingAccountInfo2 = await connection.getAccountInfo(listing2);

    assert(listingAccountInfo2 !== null);
  });

  //admin adds feed account to listing

  it("Should allow homeowner to update listing", async () => {

    //update rental rate

  });

  it("Should not allow other accounts to update listing", async () => {

    //have different homeowner or driver try to changes
    //update rental rate

  });

  it("Driver gets a list of parking spaces near destination", async () => {

    let destination_address = "1400 MyStreet, Los Angeles, CA 90210";
    let latitude;
    let longitude;
    [latitude, longitude] = [35.2273574, -118.4500036];


    const listingAccounts = await program.account.listing.all();
    assert.equal(listingAccounts.length, 2);

    console.log("Here's a list", listingAccounts);
  });

  
  it("Reserve a listing", async () => {
    const listing = PublicKey.findProgramAddressSync(
      [marketplace.toBuffer(), homeowner1.publicKey.toBuffer()],
      program.programId
    )[0];

    const listingAccountInfo = await connection.getAccountInfo(listing);
    console.log('Account data:', listingAccountInfo.data.toString());


    const duration = 1; //1 hour

    const tx = await program.methods
      .reserve(duration)
      .accountsPartial({
        renter: renter.publicKey,
        maker: homeowner1.publicKey, //is maker needed?
        marketplace: marketplace,
        listing: listing
      })
      .signers([renter])
      .rpc()
      .then(confirm)
      .then(log);
    console.log("Your transaction signature", tx);

  });

  //driver updates reservation

  //another account cannot update reservation

  it("Call switchboard feed and program ix", async () => {
    const { keypair, connection, program } = await sb.AnchorUtils.loadEnv();
    //
   // console.log("connection", connection);
    const sbProgram = program;
    //  console.log("program from sb.anchorutils", sbProgram);
    const feed = new PublicKey("J748azokS8cKaiGKgN5hsTsTuB1FJ1ikVNXKjq9DQnjg");
    const feedAccountInfo = await connection.getAccountInfo(feed);

   // console.log("feedaccountinfo", feedAccountInfo);

    const feedAccount = new sb.PullFeed(sbProgram!, feed);
    await feedAccount.preHeatLuts();

    /* const myProgramPath = "target/deploy/marketplace-keypair.json";

    async function myAnchorProgram(
      provider: anchor.Provider,
      keypath: string
    ): Promise<anchor.Program> {

      try {
        const myProgramKeypair = await sb.AnchorUtils.initKeypairFromFile(keypath);

        const pid = myProgramKeypair.publicKey;

        const idl = (await anchor.Program.fetchIdl(pid, provider))!;
        console.log("provider", provider);

        const program = new anchor.Program(idl, provider);

        return program;
      } catch (e) {
        throw new Error("Failed to load demo program. Was it deployed?");
      }
    } */


    //const myProgram = await myAnchorProgram(provider, myProgramPath);
    const myProgram = anchor.workspace.marketplace as Program<Marketplace>;

    // console.log("myProgram", myProgram?.methods);

    const [pullIx, responses, _ok, luts] = await feedAccount.fetchUpdateIx({
      numSignatures: 3,
    });
    // Instruction to example program using the switchboard feed
    // console.log("methods", await program?.methods);
    const myIx = await myProgram!.methods
      .sensorChange()
      .accounts({ feed }) //account name must match
      //.signers([maker])
      .rpc()
      // .instruction();
      .then(confirm)
      .then(log);


    const tx = await sb.asV0Tx({
      connection,
      ixs: [...pullIx!, /* myIx */],
      signers: [keypair],
      computeUnitPrice: 200_000,
      computeUnitLimitMultiple: 1.3,
      lookupTables: luts,
    });

    const TX_CONFIG = {
      commitment: "processed" as Commitment,
      skipPreflight: true,
      maxRetries: 0,
    };
    console.log("simulating..");
    const sim = await connection.simulateTransaction(tx, TX_CONFIG);
    const updateEvent = new sb.PullFeedValueEvent(
      sb.AnchorUtils.loggedEvents(sbProgram!, sim.value.logs!)[0]
    ).toRows();
    console.log("Simulated Price Updates:\n", JSON.stringify(sim.value.logs));
    console.log("Submitted Price Updates:\n", updateEvent);

    console.log(`Transaction sent: ${await connection.sendTransaction(tx)}`);


  });

  //driver confirms arrival by scanning QR code connected to b link


  //driver leaves on time and payment transferred

  //driver leaves late and is charged penalty


});
