use anchor_lang::prelude::*;

#[account] //to create PDA
#[derive(InitSpace)]
pub struct Config {
    pub seed: u64, 
    pub authority: Option<Pubkey>, //optional, for lp
    pub mint_x: Pubkey, //for lp
    pub mint_y: Pubkey, //for lp
    pub fee: u16,
    pub locked: bool, 

    pub config_bump: u8,
    pub lp_bump: u8

}