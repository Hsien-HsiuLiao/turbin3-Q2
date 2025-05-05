use anchor_lang::{prelude::*, system_program::{Transfer, transfer}};

/* use anchor_spl::{associated_token::AssociatedToken, 
    metadata::{MasterEditionAccount, Metadata, MetadataAccount}, 
    token::{close_account, transfer_checked, CloseAccount, TransferChecked}, 
    token_interface::{Mint, TokenAccount, TokenInterface}}; */


use crate::{ state::{Listing, Marketplace, ParkingSpaceStatus}};

#[derive(Accounts)]
#[instruction(sensor_id: String)]
pub struct Reserve<'info> {
   #[account(mut)]
   pub renter: Signer<'info>,
   #[account(mut)]
   pub maker: SystemAccount<'info>, //why systemaccount
   
    #[account(
       
        seeds = [b"marketplace", marketplace.name.as_bytes()], //make generic
        bump, 
    )]
    pub marketplace: Account<'info, Marketplace>,

    #[account(
        mut,
       // seeds = [marketplace.key().as_ref(), &sensor_id.to_le_bytes()], //
       seeds = [marketplace.key().as_ref(), 
        /* &sensor_id.as_bytes()[..16],  */
      //  b"A9",
        maker.key().as_ref()
        ], 
        bump,
        constraint = listing.parking_space_status == ParkingSpaceStatus::Available
        )]
    pub listing: Account<'info, Listing>,   //
   /*  #[account(
        mut, //will need to move things
  //      associated_token::mint = maker_mint,
        associated_token::authority = listing
    )]
    pub vault: InterfaceAccount<'info, TokenAccount>, */
   

    pub system_program: Program<'info, System>,

}

impl <'info> Reserve<'info> {
    pub fn reserve_listing(&mut self, duration: u16) -> Result<()> {

        let listing = &mut self.listing;
    
        // Check if the listing is available
        if listing.parking_space_status != ParkingSpaceStatus::Available {
            return Err(ErrorCode::ListingNotAvailable.into());
        }
    
        // Update the listing with the new reservation details
        listing.reserved_by = Some(self.renter.key());
        listing.reservation_duration = Some(duration);
        listing.parking_space_status = ParkingSpaceStatus::Reserved;

      Ok(())
    }

    
}

#[error_code]
pub enum ErrorCode {
    #[msg("The listing is not available for reservation.")]
    ListingNotAvailable,
}