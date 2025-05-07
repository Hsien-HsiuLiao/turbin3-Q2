use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace, Debug)]
pub struct Marketplace {
    pub admin: Pubkey,
    pub fee: u32, //basis points
    pub bump: u8, 
   
    #[max_len(16)] //be careful of length when using name as seed, seeds total cannot exceed 32bytes
    pub name: String

}