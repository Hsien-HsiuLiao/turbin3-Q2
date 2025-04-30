use anchor_lang::{prelude::*,  system_program::Transfer};

use crate::state::{Listing, Marketplace};

#[derive(Accounts)]
#[instruction(sensor_id: u64)]
pub struct UpdateListing<'info> {
    #[account(
        //derivation
        seeds = [b"marketplace", marketplace.name.as_bytes()], //make generic
        bump = marketplace.bump
    )]
    pub marketplace: Account<'info, Marketplace>,
    #[account(
        mut,
        seeds = [marketplace.key().as_ref(), &sensor_id.to_le_bytes()], 
        bump, 
        realloc = 8 + Listing::INIT_SPACE,
        realloc::payer = owner, 
        realloc::zero = true, 
    )]
    pub listing: Account<'info, Listing>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

impl <'info> UpdateListing<'info> {
    
    
    pub fn update_listing(&mut self) -> Result<()> {
        todo!();
    }
}