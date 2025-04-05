import wallet from "../Turbin3-wallet.json"
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults"
import { createGenericFile, createSignerFromKeypair, signerIdentity } from "@metaplex-foundation/umi"
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys"

// Create a devnet connection
const umi = createUmi('https://api.devnet.solana.com');

let keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const signer = createSignerFromKeypair(umi, keypair);

umi.use(irysUploader());
umi.use(signerIdentity(signer));

(async () => {
    try {
        // Follow this JSON structure
        // https://developers.metaplex.com/core/json-schema#schema-examples
//Your image URI:  https://devnet.irys.xyz/H8Lv7FLP1VRsCQs85XryqCpZD25gTkBU2JPcdN7E26FN
        /* const irysURI = myUri.replace(
            "https://arweave.net/",
            "https://devnet.irys.xyz/"
          ); */
        const image = "https://devnet.irys.xyz/H8Lv7FLP1VRsCQs85XryqCpZD25gTkBU2JPcdN7E26FN"

        const metadata = {
            name: "a new rug",
            symbol: "RUG",
            description: "regen rug",
            image,
            attributes: [
                {trait_type: 'condition', value: 'new'}
            ],
            properties: {
                files: [
                    {
                        type: "image/png",
                        uri: "https://devnet.irys.xyz/H8Lv7FLP1VRsCQs85XryqCpZD25gTkBU2JPcdN7E26FN"
                    },
                ]
            },
            creators: []
        };
        const myUri = await umi.uploader.uploadJson(metadata);

       /*  const irysURI = myUri.replace(
            "https://arweave.net/",
            "https://devnet.irys.xyz/"
          ); */
        console.log("Your metadata URI: ", myUri); //Your metadata URI:  https://arweave.net/A1RDn9zGJDdQkJ9UPJXBX8mKLLxcvixJ35Zj1iSaqUcT
    }
    catch(error) {
        console.log("Oops.. Something went wrong", error);
    }
})();
