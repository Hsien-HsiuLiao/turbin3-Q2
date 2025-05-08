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

     pub fn initialize(ctx: Context<Initialize>, name: String, fee:u32) -> Result<()> {
        ctx.accounts.init(name, fee, &ctx.bumps)?;
        Ok(())
    }

    pub fn list(ctx: Context<List>, address: String, rental_rate: u32, sensor_id: String, latitude:f64, longitude:f64, additional_info: Option<String>,availabilty_start:i64, availabilty_end:i64, email:String, phone:String) -> Result<()> {
        ctx.accounts.create_listing(address, rental_rate, sensor_id, latitude, longitude, additional_info, availabilty_start, availabilty_end, email, phone,&ctx.bumps)?;
        Ok(())
    }

    pub fn add_feed_to_listing(ctx: Context<AddFeedToListing>, feed: Pubkey) -> Result<()> {
        //only admin
        
        // Fetch the listing using the provided listing_id
        let listing = &mut ctx.accounts.listing;
    
        
    
        // Update the listing with the new feed_id
        listing.feed = Some(feed);
    
        // Optionally, you might want to log the action
        msg!("Feed {} added to listing {:?}", feed, listing );
    
        Ok(())
    }
    

    /* pub fn update_listing(
        ctx: Context<UpdateListing>, 
        address: String, 
        rental_rate: Option<u32>, 
        sensor_id: Option<String>, 
        latitude: Option<f64>, 
        longitude: Option<f64>, 
        additional_info: Option<String>, 
        availabilty_start: Option<String>, 
        availabilty_end: Option<String>
    ) -> Result<()> {
        ctx.accounts.update_listing(address, rental_rate, sensor_id, latitude, longitude, additional_info, availabilty_start, availabilty_end, &ctx.bumps)?;
        Ok(())
    } */
    pub fn set_notification_settings(ctx: Context<SetNotificationSettings>, app:bool, email: bool, phone: bool) -> Result<()> {
        ctx.accounts.set_notification_settings(app,email, phone)?;
        msg!("Notification settings updated for user: {:?}", ctx.accounts.user.key());
        Ok(())
    }

    pub fn reserve(ctx: Context<Reserve>, start_time: i64, end_time: i64) -> Result<()> {
        //pass in sensor_id if needed
        ctx.accounts.reserve_listing(start_time, end_time)?;
        Ok(())
    }

    //pub fn update_reservation()

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
        msg!("sensor data, distance_in_cm: {:?}", feed.value().unwrap());
        Ok(())

}

    //pub fn confirm_parking() {//driver scans QR code to confirm arrival and parking}, 
    //should also send alert to homeowner
    //user story 1c
    //driver receives confirmation


}

//get marketplace pda, pda will save configuration for marketplace (admin, fee, ...)
