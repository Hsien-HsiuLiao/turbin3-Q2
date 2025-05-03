use anchor_lang::prelude::*;
use switchboard_on_demand::on_demand::accounts::pull_feed::PullFeedAccountData;




use crate::{marketplace, state::{Listing, Marketplace, ParkingSpaceStatus}};

#[derive(Accounts)]
pub struct SwitchboardFeed<'info> {
    pub feed: AccountInfo<'info>,
}

impl <'info> SwitchboardFeed<'info> {
   
//    pub fn sensor_change(ctx: Context<SwitchboardFeed>) -> Result<()> { //when driver arrives or leaves
   

    
}

