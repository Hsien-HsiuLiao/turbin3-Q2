//main configuration for staking contract

use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct StakeConfig {
    pub points_per_stake: u8, //rewards points for users
    pub max_stake: u8,
    pub freeze_period: u32, //if someone wants to unstake, need to check this first
    pub rewards_bump: u8,
    pub bump: u8,

}