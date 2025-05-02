https://paulx.dev/blog/2021/01/14/programming-on-solana-an-introduction/

https://www.youtube.com/watch?v=ZMB_OqLIeGw - escrow workshop Mike MacCana

https://www.youtube.com/watch?v=Zz8-FbWRQh0 - how to succeed in solana

Raunit.sol — 8:18 AM

Yes, that's correct  the vault here is an associated token account (ATA), which is a special kind of PDA derived by the Associated Token Program, not by our own program
Since it's an ATA, Anchor knows how to derive its address using the mint and authority, so we don’t need to manually pass seeds or a bump. The associated_token attribute handles all of that. We're also using InterfaceAccount<TokenAccount> to reference an account owned by the SPL Token program, which gives us typed access to its data
This is different from a custom PDA account like in the first vault program, where we were creating a new account with custom seeds and bump. In that case, we had to specify the seeds, space, bump, and use Account because we were defining and initializing our own program-derived account from scratch
And yes, every ATA is a PDA  it’s just derived using a standard formula involving the wallet (authority), mint, and the associated token program ID.