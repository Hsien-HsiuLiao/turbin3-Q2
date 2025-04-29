import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Marketplace } from "../target/types/marketplace";

describe("parking space marketplace", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.marketplace as Program<Marketplace>;

  it("Is initialized!", async () => {
    // Add your test here.
    const listing_fee = 0.1;
    const tx = await program.methods.initialize("sol-parking", listing_fee, ).rpc();
    console.log("Your transaction signature", tx);
  });
});
