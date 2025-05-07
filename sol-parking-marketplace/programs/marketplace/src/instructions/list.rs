use anchor_lang::{prelude::*,  system_program::Transfer};

/* use anchor_spl::{associated_token::AssociatedToken, 
    metadata::{MasterEditionAccount, Metadata, MetadataAccount}, 
     
    token_interface::{Mint, TokenAccount, TokenInterface, transfer_checked, TransferChecked}}; */

use crate::state::{Listing, Marketplace, ParkingSpaceStatus};

#[derive(Accounts, Debug)]
#[instruction(sensor_id: String)]
pub struct List<'info> {
   #[account(mut)]
   pub maker: Signer<'info>,
   
    #[account(
        //derivation
        seeds = [b"marketplace", marketplace.name.as_bytes()], //make generic
        bump = marketplace.bump
    )]
    pub marketplace: Account<'info, Marketplace>,
   
   
   /*  #[account(
        init, 
        payer = maker,
        associated_token::mint = maker_mint,
        associated_token::authority = listing//owner
    )]                                                
    pub vault: InterfaceAccount<'info, TokenAccount>,  */
    #[account(
        init,
        payer = maker, 
      //  seeds = [marketplace.key().as_ref(), maker_mint.key().as_ref()], //mint is unique
        seeds = [marketplace.key().as_ref(), 
        /* &sensor_id.as_bytes()[..16],  */
      //  b"A9",
        maker.key().as_ref()
        ], //listing sensor_id

        bump,
        space = 8 + Listing::INIT_SPACE + ParkingSpaceStatus::INIT_SPACE
    )]
    pub listing: Account<'info, Listing>, //

    
    
    pub system_program: Program<'info, System>,

}

impl <'info> List<'info> {
    pub fn create_listing(&mut self, address: String, rental_rate: u32, sensor_id: String, latitude:f64 , longitude: f64 ,  additional_info: Option<String> , availabilty_start:String, availabilty_end:String,
         bumps: &ListBumps) -> Result<()> {
        self.listing.set_inner(Listing { 
            maker: self.maker.key(), 
        //    mint: self.maker_mint.key(), 
            bump: bumps.listing,
            address,
            rental_rate,
            availabilty_start, 
            availabilty_end,
            sensor_id,
            parking_space_status: ParkingSpaceStatus::Available,
            reserved_by: None,
            reservation_duration: None,
            latitude, 
            longitude, 
            additional_info, 
            feed: None //will be set by admin
        });

        msg!("You created a listing, the parking space status is : {:?}", self.listing.parking_space_status);
        msg!("Listing info: {:?}", self.listing);

      

        
        Ok(())
    }   

    
    pub fn update_listing(&mut self) -> Result<()> {
        todo!();
    }


    pub fn delete_listing(&mut self) -> Result<()> {
        todo!();
//        self.listing.close(sol_destination)
    }
}