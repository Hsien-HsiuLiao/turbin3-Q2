import wallet from "../Turbin3-wallet.json"
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults"
import { 
    createMetadataAccountV3, 
    CreateMetadataAccountV3InstructionAccounts, 
    CreateMetadataAccountV3InstructionArgs,
    DataV2Args
} from "@metaplex-foundation/mpl-token-metadata";
import { createSignerFromKeypair, signerIdentity, publicKey } from "@metaplex-foundation/umi";
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";

//https://developers.metaplex.com/token-metadata/token-standard - lists standards and fields
//https://github.com/Web3-Builders-Alliance/cohort-helper/tree/main/BonusResources/umi
//https://developers.metaplex.com/umi
//https://solana.fm/address/5ZVfRygrr7Tbgs5ugageBhUFWNvVjaWtbtV5SRSthUMF?cluster=mainnet-alpha
//https://solscan.io/token/5fYNGms2jMJeCs8uLpdJvDU6jvjEJJpqBA4kKk4BiAuW#metadata



// Define our Mint address
const mint = publicKey("H3yGGGSFLjbFBWPYT2Mg69TJteKnZmFGNBWULrPtFrit")

// Create a UMI connection
const umi = createUmi('https://api.devnet.solana.com');
const keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const signer = createSignerFromKeypair(umi, keypair);
umi.use(signerIdentity(createSignerFromKeypair(umi, keypair)));

(async () => {
    try {
        // Start here
        let accounts: CreateMetadataAccountV3InstructionAccounts = {
            mint ,
            mintAuthority: signer
            
        }

        let data: DataV2Args = {
            name: "A New Token",
            symbol: "ANT",
            uri: "http://arweave.net",
            sellerFeeBasisPoints: 50,
            creators: null,
            collection: null, 
            uses: null
            
        }

        let args: CreateMetadataAccountV3InstructionArgs = {
            data,
            isMutable: true,
            collectionDetails: null
            
        }

        let tx = createMetadataAccountV3(
            umi,
            {
                ...accounts,
                ...args
            }
        )

        let result = await tx.sendAndConfirm(umi);
        console.log(bs58.encode(result.signature)); //5GaFpThPEHzH6JD5pYk9zzyM5w8SEekCiEoe7kvTexeCSktniY897ct8zcBvSWXyMaK36pcN7gTdVVeFZ6dD5AMN
        //https://explorer.solana.com/address/H3yGGGSFLjbFBWPYT2Mg69TJteKnZmFGNBWULrPtFrit?cluster=devnet
        //https://explorer.solana.com/address/H3yGGGSFLjbFBWPYT2Mg69TJteKnZmFGNBWULrPtFrit/metadata?cluster=devnet
    } catch(e) {
        console.error(`Oops, something went wrong: ${e}`)
    }
})();
