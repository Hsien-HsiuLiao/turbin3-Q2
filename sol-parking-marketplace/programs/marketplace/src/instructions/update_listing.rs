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
    #[account(mut)]
   pub maker: SystemAccount<'info>,
    #[account(
        mut,
        seeds = [marketplace.key().as_ref(), 
        maker.key().as_ref()
        //&sensor_id.to_le_bytes()
        ], 
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
    
    
    pub fn update_listing(&mut self, 
        address: Option<String>, 
        rental_rate:Option<u32>, 
        sensor_id:Option<String>, 
        latitude:Option<f64>, 
        longitude:Option<f64>, 
        additional_info:Option<String>, 
        availabilty_start:Option<i64>, 
        availabilty_end:Option<i64>,
        email: Option<String>,
        phone: Option<String>, 
        bumps: &UpdateListingBumps) -> Result<()> {
        todo!();
    }
}