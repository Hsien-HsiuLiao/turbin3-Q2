use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace, Debug)]
pub struct Marketplace {
    pub admin: Pubkey,
    pub fee: u32, //basis points
    pub bump: u8, 
   
    #[max_len(32)] 
    pub name: String

}