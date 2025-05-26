import { Connection, PublicKey } from "@solana/web3.js";
import { Program } from "@coral-xyz/anchor";
import { IDL, Marketplace } from "./depin-panorama-parking-marketplace";
import { AnchorProvider } from '@coral-xyz/anchor';
import { AnchorWallet, useConnection, useWallet } from "@solana/wallet-adapter-react";



export const CONNECTION = new Connection(process.env.NEXT_PUBLIC_RPC ? process.env.NEXT_PUBLIC_RPC : 'https://api.devnet.solana.com',  {
    wsEndpoint: process.env.NEXT_PUBLIC_WSS_RPC ? process.env.NEXT_PUBLIC_WSS_RPC : "wss://api.devnet.solana.com",
    commitment: 'confirmed' 
  });

export const PROGRAM_ID = new PublicKey('FXUQwDsKJNrYFsfiUokPbH4BSrZtoC9m8HpoiMvYxtSE');

    const { connection } = useConnection();
    const wallet = useWallet()

const provider = new AnchorProvider(connection, wallet as AnchorWallet, { commitment: 'confirmed' })

export const PROGRAM = new Program<Marketplace>(IDL, provider/* PROGRAM_ID,  { connection: CONNECTION }*/)

