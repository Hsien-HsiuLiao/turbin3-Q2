import { Keypair, Connection, Commitment } from "@solana/web3.js";
import { createMint } from '@solana/spl-token';

//https://docs.anza.xyz/runtime/programs/

// run in ts folder solana-keygen new -o wba-wallet.json
//import wallet from "../wba-wallet.json"
import wallet from "../dev-wallet.json"

// Import our keypair from the wallet file
const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));

//Create a Solana devnet connection
const commitment: Commitment = "confirmed";
const connection = new Connection("https://api.devnet.solana.com", commitment); //Done in 4.29s.
//https://turbine-solanad-4cde.devnet.rpcpool.com/168dd64f-ce5e-4e19-a836-f6482ad6b396

//yarn spl_init
(async () => {
    try {
        // Start here
        const mint = await createMint(connection, keypair, keypair.publicKey, null ,6);
        console.log(`Mint address: ${mint}`)
//https://explorer.solana.com/tx/NyafadQQYS4jqfqEQF3YTBipHGTyechJnp558JQ2oDGz7UJzmio8pdzLUiHxyJmi8XkoWCxBF2CUt1vTTpN87q7?cluster=devnet

    } catch(error) {
        console.log(`Oops, something went wrong: ${error}`)
    }
})()
