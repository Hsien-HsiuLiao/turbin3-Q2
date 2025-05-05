import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Marketplace } from "../target/types/marketplace";
import {
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
/* import {
  getMinimumBalanceForRentExemptAccount, 
} from "@solana/spl-token"; */

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
  //, listing, , admin, , owner, feed
  const [admin, maker, renter] = Array.from({ length: 3 }, () =>
    Keypair.generate()
  );

  const marketplace_name = "a";

  let marketplace: PublicKey;
  let marketplaceBump;


  [marketplace, marketplaceBump] = PublicKey.findProgramAddressSync(
    [Buffer.from("marketplace"), Buffer.from(marketplace_name)],
    program.programId
  );

  const sensorId = "A9";

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
   // let lamports = await getMinimumBalanceForRentExemptAccount(connection);
   const makerTx = await connection.requestAirdrop(maker.publicKey, 2 * LAMPORTS_PER_SOL);
   const renterTx = await connection.requestAirdrop(renter.publicKey, 2 * LAMPORTS_PER_SOL);
   const adminTX = await connection.requestAirdrop(admin.publicKey, 2 * LAMPORTS_PER_SOL);

   // , confirm the airdrop transactions
   await connection.confirmTransaction(makerTx);
  // console.log(`Airdrop for keypair1 confirmed`);

   await connection.confirmTransaction(renterTx);
  // console.log(`Airdrop for keypair2 confirmed`);

   await connection.confirmTransaction(adminTX);

   // Log the balance of each keypair
   const balance1 = await connection.getBalance(maker.publicKey);
 //  console.log(`Balance for maker: ${balance1 / LAMPORTS_PER_SOL} SOL`);

   const balance2 = await connection.getBalance(renter.publicKey);
 //  console.log(`Balance for renter: ${balance2 / LAMPORTS_PER_SOL} SOL`);
   let tx = new Transaction();
    tx.instructions = [
      ...[maker, renter].map((account) =>
        SystemProgram.transfer({
          fromPubkey: provider.publicKey,
          toPubkey: account.publicKey,
          lamports: 10 * LAMPORTS_PER_SOL,
        })
      ),
     
      
      
    ];

  //  await provider.sendAndConfirm(tx, [maker]).then(log);
  });


  it("Is initialized!", async () => {
    // Add your test here.
    const rental_fee = 0.15;// * LAMPORTS_PER_SOL;
    const tx = await program.methods
    .initialize(marketplace_name, rental_fee, )
    .accountsPartial({
      admin: admin.publicKey,
      marketplace: marketplace,
      })
    .signers([admin])
    .rpc();
    console.log("Your transaction signature", tx);
  });

  it("Create a new listing for parking space rental", async () => {
    const address = "1234 MyStreet, Los Angeles, CA 90210";
    const rentalRate = 0.0345; //$5 USD/hr ~ 0.0345 SOL 

    [marketplace, marketplaceBump] = PublicKey.findProgramAddressSync(
      [Buffer.from("marketplace"), Buffer.from(marketplace_name)],
      program.programId
    );
    await program.methods
      .list(address, rentalRate, sensorId)
      .accountsPartial({ 
        maker: maker.publicKey,
        marketplace: marketplace, 
   //     listing: listing
       })
   //    .then(console.log("accountspartial"))
      .signers([maker])
     // .then()
      .rpc()
      .then(confirm)
      .then(log);

      const listing = PublicKey.findProgramAddressSync(
        [marketplace.toBuffer(), maker.publicKey.toBuffer()],
        program.programId
      )[0];

      const listingAccountInfo = await connection.getAccountInfo(listing);

      if (listingAccountInfo === null) {
        console.log('Account not found');
      } else {
     //   console.log('Account data:', listingAccountInfo.data);
      }
  });

  it("Reserve a listing", async () => {
    const listing = PublicKey.findProgramAddressSync(
      [marketplace.toBuffer(), maker.publicKey.toBuffer()],
      program.programId
    )[0];

    const listingAccountInfo = await connection.getAccountInfo(listing);
    console.log('Account data:', listingAccountInfo.data.toString());


    const duration = 1;

    const tx = await program.methods
    .reserve(duration )
    .accountsPartial({
      renter: renter.publicKey,
      maker: maker.publicKey, //is maker needed?
      marketplace: marketplace,
      listing: listing
      })
    .signers([renter])
    .rpc()
    .then(confirm)
    .then(log);
    console.log("Your transaction signature", tx);
  });

});
