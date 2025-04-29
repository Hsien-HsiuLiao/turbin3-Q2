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
  ASSOCIATED_TOKEN_PROGRAM_ID,
  // TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountIdempotentInstruction,
  createInitializeMint2Instruction,
  createMintToInstruction,
  getAssociatedTokenAddressSync,
  getMinimumBalanceForRentExemptMint,
} from "@solana/spl-token";
import { randomBytes } from "crypto";
import { machine } from "os";
import { Metadata, MPL_TOKEN_METADATA_PROGRAM_ID } from "@metaplex-foundation/mpl-token-metadata";



describe("marketplace", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.marketplace as Program<Marketplace>;

  

  const provider = anchor.getProvider();

  const connection = provider.connection;

  const programId = program.programId;
  const tokenProgram = TOKEN_2022_PROGRAM_ID;
  const metadataProgram = MPL_TOKEN_METADATA_PROGRAM_ID;
  const associatedTokenProgram = ASSOCIATED_TOKEN_PROGRAM_ID;

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

  const [maker, taker, mintA, mintB, maker_mint] = Array.from({ length: 5 }, () =>
    Keypair.generate()
  );
  const [makerAtaA, makerAtaB, takerAtaA, takerAtaB] = [maker, taker]
    .map((a) =>
      [mintA, mintB].map((m) =>
        getAssociatedTokenAddressSync(m.publicKey, a.publicKey, false, tokenProgram)
      )
    )
    .flat();

    //maker_mint, maker
  const [makerAta] = [maker]
    .map((a) =>
    [maker_mint].map((m) =>
      getAssociatedTokenAddressSync(m.publicKey, a.publicKey, false, tokenProgram)
      )
    )
    .flat();

  const marketplace_name = "MyMarketPlace";

  const marketplace = PublicKey.findProgramAddressSync(
    [Buffer.from("marketplace"), Buffer.from(marketplace_name) ],
    program.programId
  )[0];

  const listing = PublicKey.findProgramAddressSync(
    [marketplace.toBuffer(), maker.publicKey.toBuffer()],
    program.programId
  )[0];

  const vault = getAssociatedTokenAddressSync(maker_mint.publicKey, listing, true, tokenProgram);

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
    marketplace,
    vault,
    tokenProgram,

    //admin
//treasury
//rewards_mint
//maker_mint
makerAta,
//taker_ata
listing,
//collection_mint
//metadata,
//masterEdition,
metadataProgram
//associated_token_program
  }

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods
                .initialize(marketplace_name, 0.1)
                .accounts({...accounts})
                .rpc();
    console.log("Your transaction signature", tx);
  });

  it("list NFT on marketplace", async () => {
    let nft_price = new BN(1234);

    const tx = await program.methods
                .list(nft_price)
                .accountsPartial({
                  maker: maker.publicKey,
                  makerMint: maker_mint.publicKey,
                  makerAta,
                  marketplace: marketplace,
                  // metadata: metadata,
                  // collectionMint: 
                  // masterEdition: masterEdition,
                  metadataProgram,
                  tokenProgram,
                  associatedTokenProgram,
                })
                .signers([maker])
                .rpc();
    console.log("Your transaction signature", tx);
    
  });
});
