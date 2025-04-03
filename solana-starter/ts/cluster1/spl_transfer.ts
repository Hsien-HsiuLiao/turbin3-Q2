import { Commitment, Connection, Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js"
import wallet from "../Turbin3-wallet.json"
import { getOrCreateAssociatedTokenAccount, transfer } from "@solana/spl-token";

// We're going to import our keypair from the wallet file
const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));

//Create a Solana devnet connection
const commitment: Commitment = "confirmed";
const connection = new Connection("https://api.devnet.solana.com", commitment);

// Mint address
const mint = new PublicKey("H3yGGGSFLjbFBWPYT2Mg69TJteKnZmFGNBWULrPtFrit");

// Recipient address
const to = new PublicKey("8rhBeTmTAimzbmfXUBC2mVhUSwT7LQM1KfwCcKPkZVHk"); //from prereq 4aceMBu9SXiRNvw1CrYjGnXoUraitRRndBawFvSJUSgw

(async () => {
    try {
        // Get the token account of the fromWallet address, and if it does not exist, create it
        const fromATA = await getOrCreateAssociatedTokenAccount(connection, keypair, mint, keypair.publicKey)

        // Get the token account of the toWallet address, and if it does not exist, create it
         const toATA = await getOrCreateAssociatedTokenAccount(connection, keypair, mint, to); // owner is to(recipient address)

        // Transfer the new token to the "toTokenAccount" we just created
        const signature = await transfer(connection, keypair, fromATA.address, toATA.address, keypair.publicKey, 101);

        console.log(`trasnsfer: ${signature}`); //5CWtstGdWKFCUaZWhwEYHehjpguKCdQiDWoCuXZRhwgVLRjJZ85HL9zdwLKdk7Mopp8TEhsT4Vvmw7AwoRqf3a44
 

    } catch(e) {
        console.error(`Oops, something went wrong: ${e}`)
    }
})();