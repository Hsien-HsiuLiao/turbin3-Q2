#![allow(unexpected_cfgs)]

use anchor_lang::prelude::*;
use switchboard_on_demand::on_demand::accounts::pull_feed::PullFeedAccountData;

mod instructions;
mod state;
mod error;

pub use error::ErrorCode;


use instructions::*;
//use crate::instruction::*;

declare_id!("FXUQwDsKJNrYFsfiUokPbH4BSrZtoC9m8HpoiMvYxtSE");

#[program]
pub mod marketplace {

    use switchboard_on_demand::prelude::rust_decimal::Decimal;

    use crate::state::ParkingSpaceStatus;

    use super::*;

    pub fn initialize(ctx: Context<Initialize>, name: String, fee: u32) -> Result<()> {
        ctx.accounts.init(name, fee, &ctx.bumps)?;
        Ok(())
    }

    pub fn list(
        ctx: Context<List>,
        address: String,
        rental_rate: u32,
        sensor_id: String,
        latitude: f64,
        longitude: f64,
        additional_info: Option<String>,
        availabilty_start: i64,
        availabilty_end: i64,
        email: String,
        phone: String,
    ) -> Result<()> {
        ctx.accounts.create_listing(
            address,
            rental_rate,
            sensor_id,
            latitude,
            longitude,
            additional_info,
            availabilty_start,
            availabilty_end,
            email,
            phone,
            &ctx.bumps,
        )?;
        Ok(())
    }

    pub fn add_feed_to_listing(ctx: Context<AddFeedToListing>, feed: Pubkey) -> Result<()> {
        ctx.accounts.add_feed(feed)?;
        Ok(())
    }

    pub fn update_listing(
        ctx: Context<UpdateListing>,
        address: Option<String>,
        rental_rate: Option<u32>,
        sensor_id: Option<String>,
        latitude: Option<f64>,
        longitude: Option<f64>,
        additional_info: Option<String>,
        availabilty_start: Option<i64>,
        availabilty_end: Option<i64>, 
        email: Option<String>,
        phone: Option<String>
    ) -> Result<()> {
        ctx.accounts.update_listing(address, rental_rate, sensor_id, latitude, longitude, additional_info, availabilty_start, availabilty_end, email, phone, &ctx.bumps)?;
        Ok(())
    }

    pub fn delete_listing(_ctx: Context<DeleteListing>) -> Result<()> {
        msg!("Listing deleted");
        Ok(())
    }

    pub fn set_notification_settings(
        ctx: Context<SetNotificationSettings>,
        app: bool,
        email: bool,
        phone: bool,
    ) -> Result<()> {
        ctx.accounts.set_notification_settings(app, email, phone)?;
        msg!(
            "Notification settings updated for user: {:?}",
            ctx.accounts.user.key()
        );
        Ok(())
    }

    pub fn reserve(ctx: Context<Reserve>, start_time: i64, end_time: i64) -> Result<()> {
        ctx.accounts.reserve_listing(start_time, end_time)?;
        Ok(())
    }

    //pub fn update_reservation()

    pub fn sensor_change<'a>(ctx: Context<SwitchboardFeed>) -> Result<()> {
        //when driver arrives or leaves
        // Feed account data
        let feed_account = ctx.accounts.feed.data.borrow();
       // msg!("feed_account.: {:?}", feed_account);

        // Verify that this account is the intended one by comparing public keys
        // if ctx.accounts.feed.key != &specific_pubkey {
        //     throwSomeError
        // }
        //

        // Docs at: https://switchboard-on-demand-rust-docs.web.app/on_demand/accounts/pull_feed/struct.PullFeedAccountData.html
        let feed = PullFeedAccountData::parse(feed_account).unwrap();
        // Log the value
       // msg!("feeed.: {:?}", feed);
        msg!("sensor data, distance_in_cm: {:?}", feed.value().unwrap());
        //distance < 30 cm, car parked, >30cm car left space

        //when driver leaves, sensor detects change. a server function monitoring for changes (or anchor test) will
        // call this instruction, get the data and verify value is over x cm, then msg homeowner and parkingspace status updated

        //user story 1c
    //driver receives confirmation

    let distance= feed.value().unwrap();

    // Check if the distance indicates the car has left the space
    if distance > Decimal::from(30) {
        let listing = &mut ctx.accounts.listing;

        // Update the parking space status to Available
        listing.parking_space_status = ParkingSpaceStatus::Available;

        // Notify the homeowner of the change

      //  msg!("Parking space is now available for listing: {:?}", listing);

        //check if driver left on time and/or within 5 min grace period
        //if not charge a penalty and transfer to homeowner

    }
   /*  if distance <= Decimal::from(30){
        //cannot yet confirm parking space in use, driver needs to also scan QR code to confirm
    } */

        Ok(())
    }

    // {//driver scans QR code to confirm arrival and parking},
    //should also send alert to homeowner
    pub fn confirm_parking(ctx: Context<ConfirmParking>, sensor_id: String) -> Result<()> {
        ctx.accounts.confirm_parking(sensor_id)?;
        Ok(())
    }
    
}


