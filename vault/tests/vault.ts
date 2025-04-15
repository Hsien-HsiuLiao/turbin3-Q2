import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Vault } from "../target/types/vault";
import { Keypair, PublicKey, SystemProgram, LAMPORTS_PER_SOL, sendAndConfirmTransaction, Transaction } from '@solana/web3.js';
import {  createAccount, getMinimumBalanceForRentExemptMint, MINT_SIZE, TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";
import { confirmTransaction } from "@solana-developers/helpers";

//https://www.anchor-lang.com/docs/basics/program-structure#declare_id-macro
//anchor keys sync
const vaultAddress = new PublicKey("3YJsLgDvMoRHr5ttc19ZVdvTVfFHWE81FVcBgWLBKTFb");

const provider = anchor.AnchorProvider.env();
const connection = provider.connection;

let vault;
  let vault_state;
  let bump;


describe("vault", async () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.vault as Program<Vault>;

  const user = (provider.wallet as anchor.Wallet).payer;
  const payer = user;

  it("Is initialized!", async () => {
    // Add your test here.
   // const tx = await program.methods.initialize().rpc();

   //try catch
   const initTx = await program.methods
   .initialize()
   .accounts({
       //signer: program.provider.publicKey,
       signer: payer.publicKey,
    //   vault,
   //    vaultState: vaultState.publicKey,
     //  systemProgram: SystemProgram.programId,
   })
   .signers([payer])
   .rpc();

    console.log("Your transaction signature", initTx);




    
  });

  it("make a deposit into vault", async () => {
    const balance = await connection.getBalance(payer.publicKey);
    console.log(`Payer balance: ${balance}`);

    [vault_state, bump] = PublicKey.findProgramAddressSync([
      Buffer.from("state"),
      payer.publicKey.toBuffer(),
  ], program.programId);
  
    [vault, bump] = PublicKey.findProgramAddressSync([
      Buffer.from("vault"),
      vault_state.toBuffer(),
    ], program.programId);

      /*  */
        let sol = 2;
        let vault_airdrop_tx_sig = await connection.requestAirdrop(
          vault,
          sol * LAMPORTS_PER_SOL
        );

        console.log("✍🏾 Airdrop Signature: ", vault_airdrop_tx_sig);

 let confirmedAirdrop = await confirmTransaction(connection, vault_airdrop_tx_sig, "confirmed");
 
 

 /*  console.log(`🪂 Airdropped ${sol} SOL to ${vault.toBase58()}`);
  console.log("✅ Tx Signature: ", confirmedAirdrop); */

    const accounts = {
      signer: payer.publicKey,
      vaultState: vault_state,
      vault: vault,
      systemProgram: SystemProgram.programId,      
     }
    
    const depositTx = await program.methods
    .deposit(new anchor.BN(7))
    .accounts({
      ...accounts            })
    .signers([payer])
    .rpc();

    //get deposit value
    const vault_balance = await connection.getBalance(vault);

    console.log("vault balance after deposit: ",vault_balance);

  });
});
