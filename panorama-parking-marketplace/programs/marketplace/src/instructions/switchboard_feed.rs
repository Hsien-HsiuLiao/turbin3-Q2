use anchor_lang::prelude::*;
use switchboard_on_demand::on_demand::accounts::pull_feed::PullFeedAccountData;




use crate::{ state::{Listing, Marketplace, ParkingSpaceStatus}};

#[derive(Accounts)]
pub struct SwitchboardFeed<'info> {
    //safety check: Struct field "feed" is unsafe, but is not documented.add ///CHECK
        /// CHECK: via switchboard sdk
    pub feed: AccountInfo<'info>,

    #[account(
        //derivation
        seeds = [b"marketplace", marketplace.name.as_bytes()], //make generic
        bump = marketplace.bump
    )]
    pub marketplace: Account<'info, Marketplace>,
    #[account(mut)]
    pub maker: Signer<'info>,
    #[account(
        mut,
        seeds = [marketplace.key().as_ref(), 
        maker.key().as_ref()
        //&sensor_id.to_le_bytes()
        ], 
        bump, 
        realloc = 8 + Listing::INIT_SPACE,
        realloc::payer = maker, 
        realloc::zero = true, 
    )]
    pub listing: Account<'info, Listing>,
    pub system_program: Program<'info, System>,

}

impl <'info> SwitchboardFeed<'info> {
   
//    pub fn sensor_change(ctx: Context<SwitchboardFeed>) -> Result<()> { //when driver arrives or leaves
   

    
}

