import { Transaction, SystemProgram, Connection, Keypair, LAMPORTS_PER_SOL, sendAndConfirmTransaction, PublicKey } from "@solana/web3.js";
// Import our dev wallet keypair from the wallet file  
import wallet from "./dev-wallet.json";

const from = Keypair.fromSecretKey(new Uint8Array(wallet));
// Define our Turbin3 public key  
const to = new PublicKey("Coop1aAuEqbN3Pm9TzohXvS3kM4zpp3pJZ9D4M2uWXH2");

//Create a Solana devnet connection 
const connection = new Connection("https://api.devnet.solana.com");

//create a transaction using @solana/web3.js to transfer 0.1 SOL from our dev wallet to our Turbin3 wallet address on the Solana devenet. 
(async () => { 
    try { 
        const transaction = new Transaction().add(
            SystemProgram.transfer({ 
                fromPubkey: from.publicKey, 
                toPubkey: to, 
                lamports: LAMPORTS_PER_SOL / 10, 
            })
        ); 
        transaction.recentBlockhash = (await 
            connection.getLatestBlockhash('confirmed')).blockhash; 
            transaction.feePayer = from.publicKey;

// Sign transaction, broadcast, and confirm  
        const signature = await sendAndConfirmTransaction(  
            connection,  
            transaction,  
            [from]  
        );  
        console.log(`Success! Check out your TX here:  
            https://explorer.solana.com/tx/${signature}?cluster=devnet`); 
        } catch(e) {  
            console.error(`Oops, something went wrong: ${e}`)  
        }  
    })(); 