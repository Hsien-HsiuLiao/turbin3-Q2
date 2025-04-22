//delegate token for a stake account

use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct StakeAccount {
    pub owner: Pubkey, //to correlate
    pub mint: Pubkey, // for a specific mint
    pub staked_at: i64, // want to save stake epoch
    pub bump: u8, //save bump so we don't have to derive every time
}

//stake acct associated with  nft
//every nft will have a stake acct