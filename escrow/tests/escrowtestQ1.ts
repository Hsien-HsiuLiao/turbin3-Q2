import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Escrow } from "../target/types/escrow";
import { BN, min } from "bn.js";
import {createAssociatedTokenAccountIdempotentInstruction, createInitializeMint2Instruction, createMintToInstruction, getAssociatedTokenAddressSync} from "@solana/spl-token";
import {  getMinimumBalanceForRentExemptMint, MINT_SIZE, TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram } from "@solana/web3.js";
import { randomBytes} from "crypto";

describe("escrowtestQ1", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());
  const provider = anchor.getProvider();

  const program = anchor.workspace.escrow as Program<Escrow>;

  const maker = anchor.web3.Keypair.generate();
  const taker = anchor.web3.Keypair.generate();
  const mintA = anchor.web3.Keypair.generate();
  const mintB = anchor.web3.Keypair.generate();
  const seed = new BN(randomBytes(8));
  const tokenProgram = TOKEN_2022_PROGRAM_ID;
  const makerAtaA = getAssociatedTokenAddressSync(maker.publicKey, mintA.publicKey,false, tokenProgram);
  const [escrow] = PublicKey.findProgramAddressSync(
    [Buffer.from("escrow"), maker.publicKey.toBuffer(), seed.toArrayLike(Buffer, "le", 8) ], 
    program.programId
  ); 
  const vault = getAssociatedTokenAddressSync(mintA.publicKey, escrow, true, tokenProgram);

  const accounts = {
    
   maker : maker.publicKey,
   mintA : mintA.publicKey,
   mintB : mintB.publicKey,
   seed ,
   tokenProgram ,
   makerAtaA ,
   escrow ,
   vault ,
   taker ,

  }
  it("airdrop", async () => {
    let lamports = await getMinimumBalanceForRentExemptMint(program.provider.connection);
    let tx = new anchor.web3.Transaction();
      tx.instructions = [
        //ix no 1
        SystemProgram.transfer({
          fromPubkey: program.provider.publicKey,
          toPubkey: maker.publicKey,
          lamports: 0.2 * LAMPORTS_PER_SOL
        }),
                //ix no 2
        SystemProgram.transfer({
          fromPubkey: program.provider.publicKey,
          toPubkey: taker.publicKey,
          lamports: 0.2 * LAMPORTS_PER_SOL
        }),
                //ix no 3
        SystemProgram.createAccount({
          fromPubkey: program.provider.publicKey,
          newAccountPubkey: mintA.publicKey,
          lamports,
          space: MINT_SIZE,
          programId: tokenProgram
        }),
                //ix no 4
        SystemProgram.createAccount({
          fromPubkey: program.provider.publicKey,
          newAccountPubkey: mintB.publicKey,
          lamports,
          space: MINT_SIZE,
          programId: tokenProgram
        }),
                //ix no 5
    //    createInitializeMint2Instruction(mintA.publicKey, 6, maker.publicKey, null, tokenProgram),
    //    createAssociatedTokenAccountIdempotentInstruction(provider.publicKey, makerAtaA, maker.publicKey, mintA.publicKey, tokenProgram),
      //  createMintToInstruction(mintA.publicKey, makerAtaA, maker.publicKey, 1e9, undefined, tokenProgram),
      //  createInitializeMint2Instruction(mintB.publicKey, 6, taker.publicKey, tokenProgram),
     //   createAssociatedTokenAccountIdempotentInstruction(provider.publicKey, makerAtaA, maker.publicKey, mintA.publicKey, tokenProgram),
    //    createMintToInstruction(mintB.publicKey, makerAtaA, taker.publicKey, 1e9, undefined, tokenProgram),



      ];

    //  await provider.sendAndConfirm(tx, [maker, mintA, mintB]); //array of valid signers

  });


  it("make an escrow", async () => {
    // Add your test here.
 /*    const tx = await program.methods.make(
      new BN(1),
      new BN(1),
      new BN(1),
    )
 //   .accountsPartial
    .accounts({
      ...accounts
    })
    .rpc();
    console.log("Your transaction signature", tx); */
  });
});
