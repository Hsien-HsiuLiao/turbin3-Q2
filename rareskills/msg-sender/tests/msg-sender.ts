import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { MsgSender } from "../target/types/msg_sender";

describe("msg-sender", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.msgSender as Program<MsgSender>;

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods.initialize().rpc();
    console.log("Your transaction signature", tx);
  });
});

describe("Day14", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

 // const program = anchor.workspace.Day14 as Program<Day14>;
  const program = anchor.workspace.Day14 as Program<MsgSender>;


  it("Is signed by a single signer", async () => {
    // Add your test here.
    const tx = await program.methods.initialize().accounts({
      signer1: program.provider.publicKey
    }).rpc();

    console.log("The signer1: ", program.provider.publicKey.toBase58());
  });
});