use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct UserAccount {
    pub points: u32,      // reward points for user
    pub amount_staked: u8, // limit how many nfts user staking, may want to limit
    pub bump: u8,
}