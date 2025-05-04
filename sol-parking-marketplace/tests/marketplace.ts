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
  //marketplace, listing, , admin, , owner, feed
  const [maker, renter] = Array.from({ length: 2 }, () =>
    Keypair.generate()
  );



  it("Airdrop", async () => {
    console.log("maker", maker.publicKey);
console.log("renter", renter.publicKey);
   // let lamports = await getMinimumBalanceForRentExemptAccount(connection);
   const makerTx = await connection.requestAirdrop(maker.publicKey, 2 * LAMPORTS_PER_SOL);
   const renterTx = await connection.requestAirdrop(renter.publicKey, 2 * LAMPORTS_PER_SOL);

   // , confirm the airdrop transactions
   await connection.confirmTransaction(makerTx);
   console.log(`Airdrop for keypair1 confirmed`);

   await connection.confirmTransaction(renterTx);
   console.log(`Airdrop for keypair2 confirmed`);
   // Log the balance of each keypair
   const balance1 = await connection.getBalance(maker.publicKey);
   console.log(`Balance for maker: ${balance1 / LAMPORTS_PER_SOL} SOL`);

   const balance2 = await connection.getBalance(renter.publicKey);
   console.log(`Balance for renter: ${balance2 / LAMPORTS_PER_SOL} SOL`);
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
    const listing_fee = 0.1;
    const marketplace_name = "Rent-a-parking-space";
    const tx = await program.methods.initialize(marketplace_name, listing_fee, ).rpc();
    console.log("Your transaction signature", tx);
  });
});
