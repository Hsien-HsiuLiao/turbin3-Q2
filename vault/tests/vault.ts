import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Vault } from "../target/types/vault";
import { Keypair, PublicKey, SystemProgram, LAMPORTS_PER_SOL, Transaction } from '@solana/web3.js';
import {  getMinimumBalanceForRentExemptMint, MINT_SIZE,  } from "@solana/spl-token";
import { confirmTransaction } from "@solana-developers/helpers";
import { assert } from "chai";


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

  it("Is initialized!", async () => {
    // Add your test here.
   // const tx = await program.methods.initialize().rpc();

   const initTx = await program.methods
      .initialize()
      .accounts({
          //signer: program.provider.publicKey,
          signer: payer.publicKey,
      })
      .signers([payer])
      .rpc();

    console.log("Your transaction signature", initTx);
    
  });

  it("make a deposit into vault", async () => {
    const balance = await connection.getBalance(payer.publicKey);
    console.log(`Payer balance: ${balance}`);

    //https://solana.com/developers/cookbook/accounts/create-pda-account#generating-a-pda
    [vault_state, bump] = PublicKey.findProgramAddressSync([
      Buffer.from("state"),
      payer.publicKey.toBuffer(),
      ], program.programId);
  
    [vault, bump] = PublicKey.findProgramAddressSync([
      Buffer.from("vault"),
      vault_state.toBuffer(),
    ], program.programId);

      /*  https://solana.com/developers/cookbook/development/test-sol  */
      //https://solana.com/developers/cookbook/accounts/create-account
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
    
     const amount = new anchor.BN(1_500_000_000);
    const depositTx = await program.methods
    .deposit(amount)
    .accounts({
      ...accounts            })
    .signers([payer])
    .rpc();

    //get deposit value
    //https://solana.com/developers/cookbook/accounts/get-account-balance
    const vault_balance = await connection.getBalance(vault);

    //console.log("vault balance after deposit: ",);
    assert.equal(vault_balance, 3_500_000_000);

  });
});
