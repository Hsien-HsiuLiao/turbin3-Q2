import { createUmi } from "@metaplex-foundation/umi-bundle-defaults"
import { createSignerFromKeypair, signerIdentity, generateSigner, percentAmount } from "@metaplex-foundation/umi"
import { createNft, mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";

import wallet from "../Turbin3-wallet.json"
import base58 from "bs58";

const RPC_ENDPOINT = "https://api.devnet.solana.com";
const umi = createUmi(RPC_ENDPOINT);

let keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const myKeypairSigner = createSignerFromKeypair(umi, keypair);
umi.use(signerIdentity(myKeypairSigner));
umi.use(mplTokenMetadata())

const mint = generateSigner(umi);

(async () => {
    let tx = createNft(umi, {
        mint,
        name: "A new rug",
        symbol: "RUG",
        uri: "https://devnet.irys.xyz/A1RDn9zGJDdQkJ9UPJXBX8mKLLxcvixJ35Zj1iSaqUcT",
        sellerFeeBasisPoints: percentAmount(5)
    });

    let result = await tx.sendAndConfirm(umi);
    const signature = base58.encode(result.signature);

    console.log(`Succesfully Minted! Check out your TX here:\nhttps://explorer.solana.com/tx/${signature}?cluster=devnet`)
    //https://explorer.solana.com/tx/3XGDbYJd9jKuhEz44Duzgn7WH9ayRKNxWt94b3TkGEEwPUCeCARZ9orth8VrDTHZr5FAtwLPGQTGrXUwyQMgDCuc?cluster=devnet

    console.log("Mint Address: ", mint.publicKey);
    //Mint Address:  AHPkZz7ntNhcivLHb1iKiMFgtWzsxkjNPc7wNdZQMXat
})();