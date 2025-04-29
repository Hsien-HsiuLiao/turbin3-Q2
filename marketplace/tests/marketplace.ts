import * as anchor from "@coral-xyz/anchor";
import { Program, BN } from "@coral-xyz/anchor";
import { Marketplace } from "../target/types/marketplace";
import {
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import {
  MINT_SIZE,
  TOKEN_2022_PROGRAM_ID,
  // TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountIdempotentInstruction,
  createInitializeMint2Instruction,
  createMintToInstruction,
  getAssociatedTokenAddressSync,
  getMinimumBalanceForRentExemptMint,
} from "@solana/spl-token";
import { randomBytes } from "crypto";


describe("marketplace", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.marketplace as Program<Marketplace>;

  

  const provider = anchor.getProvider();

  const connection = provider.connection;

  const programId = program.programId;
  const tokenProgram = TOKEN_2022_PROGRAM_ID;

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

  //const seed = new BN(randomBytes(8));

  const [maker, taker, mintA, mintB] = Array.from({ length: 4 }, () =>
    Keypair.generate()
  );
  const [makerAtaA, makerAtaB, takerAtaA, takerAtaB] = [maker, taker]
    .map((a) =>
      [mintA, mintB].map((m) =>
        getAssociatedTokenAddressSync(m.publicKey, a.publicKey, false, tokenProgram)
      )
    )
    .flat();

  /* const escrow = PublicKey.findProgramAddressSync(
    [Buffer.from("escrow"), maker.publicKey.toBuffer(), seed.toArrayLike(Buffer, "le", 8)],
    program.programId
  )[0]; */

 // const vault = getAssociatedTokenAddressSync(mintA.publicKey, escrow, true, tokenProgram);

  // Accounts
  const accounts = {
    maker: maker.publicKey,
    taker: taker.publicKey,
    mintA: mintA.publicKey,
    mintB: mintB.publicKey,
    makerAtaA,
    makerAtaB,
    takerAtaA,
    takerAtaB,
  //  escrow,
  //marketplace
  //  vault,
    tokenProgram,

    //admin
//treasury
//rewards_mint
//maker_mint
//maker_ata
//taker_ata
//listing
//collection_mint
//metadata
//master_edition
//metadata_program
//associated_token_program
  }

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods
                .initialize("MyMarketplace", 0.1)
                .accounts({...accounts})
                .rpc();
    console.log("Your transaction signature", tx);
  });
});
