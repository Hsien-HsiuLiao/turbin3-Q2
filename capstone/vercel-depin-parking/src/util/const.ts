import { Connection, PublicKey } from "@solana/web3.js";
import { Program } from "@coral-xyz/anchor";
import { IDL, Marketplace } from "./depin-panorama-parking-marketplace";

export const CONNECTION = new Connection(process.env.NEXT_PUBLIC_RPC ? process.env.NEXT_PUBLIC_RPC : 'https://api.devnet.solana.com',  {
    wsEndpoint: process.env.NEXT_PUBLIC_WSS_RPC ? process.env.NEXT_PUBLIC_WSS_RPC : "wss://api.devnet.solana.com",
    commitment: 'confirmed' 
  });

export const PROGRAM_ID = new PublicKey('FXUQwDsKJNrYFsfiUokPbH4BSrZtoC9m8HpoiMvYxtSE');

export const PROGRAM = new Program<Marketplace>(IDL, /* PROGRAM_ID, */ { connection: CONNECTION })

