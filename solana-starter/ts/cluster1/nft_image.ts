import wallet from "../Turbin3-wallet.json"
// import wallet from "../wba-wallet.json"
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  createGenericFile,
  createSignerFromKeypair,
  signerIdentity,
} from "@metaplex-foundation/umi";
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys";
import { readFile } from "fs/promises";

const imagePath = "generug.png";
// Create a devnet connection
const umi = createUmi("https://api.devnet.solana.com");

let keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const signer = createSignerFromKeypair(umi, keypair);

umi.use(irysUploader({ address: "https://devnet.irys.xyz/" }));
umi.use(signerIdentity(signer));

/* pnpm = good
yarn = good
bun = good
npm = 1 hour scream room */

(async () => {
  try {
    //1. Load image
    //2. Convert image to generic file.
    //3. Upload image
    const image = await readFile("./" + imagePath); // put the file in the ts directory
    const file = createGenericFile(image, imagePath, {
      contentType: "image/jpg",
    });
    const [myUri] = await umi.uploader.upload([file]);
    const irysURI = myUri.replace(
      "https://arweave.net/",
      "https://devnet.irys.xyz/"
    );
    console.log("Your image URI: ", irysURI);
  } catch (error) {
    console.log("Oops.. Something went wrong", error);
  }
})();