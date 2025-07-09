use anchor_lang::prelude::*;

//escrow stores what maker wants in exchange for what is in vault

#[account]
#[derive(InitSpace)]
pub struct Escrow {
    pub seed: u64,          //seed makes it possible for one person to setup multiple escrow
    pub maker: Pubkey,
    pub mint_a: Pubkey,
    pub mint_b: Pubkey,
    pub receive: u64,       //how much maker wants to receive
    pub bump: u8

}