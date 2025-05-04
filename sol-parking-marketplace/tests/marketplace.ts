import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Marketplace } from "../target/types/marketplace";

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
  //marketplace, listing, maker, admin, renter, owner, feed

  it("Is initialized!", async () => {
    // Add your test here.
    const listing_fee = 0.1;
    const marketplace_name = "Rent-a-parking-space";
    const tx = await program.methods.initialize(marketplace_name, listing_fee, ).rpc();
    console.log("Your transaction signature", tx);
  });
});
