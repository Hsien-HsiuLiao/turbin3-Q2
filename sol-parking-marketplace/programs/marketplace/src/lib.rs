#![allow(unexpected_cfgs)]

use anchor_lang::prelude::*;
use switchboard_on_demand::on_demand::accounts::pull_feed::PullFeedAccountData;



mod instructions;
mod state;

use instructions::*;


declare_id!("FXUQwDsKJNrYFsfiUokPbH4BSrZtoC9m8HpoiMvYxtSE");

#[program]
pub mod marketplace {
    use super::*;

     pub fn initialize(ctx: Context<Initialize>, name: String, fee:u16) -> Result<()> {
        ctx.accounts.init(name, fee, &ctx.bumps)?;
        Ok(())
    }

    pub fn list(ctx: Context<List>, price: u64) -> Result<()> {
        ctx.accounts.create_listing(price, &ctx.bumps)?;
        Ok(())
    }

    pub fn reserve(ctx: Context<Reserve>, duration: u64) -> Result<()> {
        ctx.accounts.reserve_listing(duration)?;
        Ok(())
    }

    pub fn sensor_change<'a>(ctx: Context<SwitchboardFeed>) -> Result<()> { //when driver arrives or leaves
        // Feed account data
        let feed_account = ctx.accounts.feed.data.borrow();

        // Verify that this account is the intended one by comparing public keys
        // if ctx.accounts.feed.key != &specific_pubkey {
        //     throwSomeError
        // }

        // Docs at: https://switchboard-on-demand-rust-docs.web.app/on_demand/accounts/pull_feed/struct.PullFeedAccountData.html
        let feed = PullFeedAccountData::parse(feed_account).unwrap();
        // Log the value
        msg!("distance: {:?}", feed.value());
        Ok(())

}

    //pub fn confirm_parking() {//driver scans QR code to confirm arrival and parking}


}

//get marketplace pda, pda will save configuration for marketplace (admin, fee, ...)
