import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { Program, Wallet, AnchorProvider } from "@coral-xyz/anchor";
import { IDL, Turbin3Prereq } from "./programs/Turbin3_prereq";
import base58pkey from "./Turbin3-wallet.json";
import bs58 from 'bs58' 

const keypair = Keypair.fromSecretKey(new Uint8Array(bs58.decode(base58pkey)));

const connection = new Connection("https://api.devnet.solana.com");

const github = Buffer.from("Hsien-HsiuLiao", "utf8");
// Create our anchor provider
const provider = new AnchorProvider(connection, new Wallet(keypair), { commitment: "confirmed"});  

// Create our program  
const program : Program<Turbin3Prereq> = new Program(IDL, provider); 

// Create the PDA for our enrollment account  
const enrollment_seeds = [Buffer.from("prereq"),  
    keypair.publicKey.toBuffer()];

const [enrollment_key, _bump] =  
    PublicKey.findProgramAddressSync(enrollment_seeds, program.programId);


// Execute our enrollment transaction  
(async () => {  
    try {  
        const txhash = await program.methods  
        .submit(github)  
        .accounts({  
            signer: keypair.publicKey,  
        })  
        .signers([  
            keypair  
        ]).rpc();  
        console.log(`Success! Check out your TX here:  
            https://explorer.solana.com/tx/${txhash}?cluster=devnet`); 
        } catch(e) { 
            console.error(`Oops, something went wrong: ${e}`)  
        }
    })();     