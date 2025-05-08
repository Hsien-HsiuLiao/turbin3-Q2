use anchor_lang::{prelude::*, system_program::{Transfer, transfer}};


use crate::{ state::{Listing, Marketplace, ParkingSpaceStatus}};

#[derive(Accounts)]
//#[instruction(sensor_id: String)]
/* Error: AnchorError occurred. Error Code: InstructionDidNotDeserialize. Error Number: 102. 
Error Message: The program could not deserialize the given instruction.
 */
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
        maker.key().as_ref()
        ], 
        bump,
        constraint = listing.parking_space_status == ParkingSpaceStatus::Available
        )]
    pub listing: Account<'info, Listing>,   //
   

    pub system_program: Program<'info, System>,

}

impl <'info> Reserve<'info> {
    pub fn reserve_listing(&mut self, start_time: i64, end_time: i64) -> Result<()> {

        //need reservation start time and end time
        let listing = &mut self.listing;
    
        // Check if the listing is available
        if listing.parking_space_status != ParkingSpaceStatus::Available {
            return Err(ErrorCode::ListingNotAvailable.into());
        }
    
        // Update the listing with the new reservation details
        listing.reserved_by = Some(self.renter.key());
        listing.reservation_start = Some(start_time);
        listing.reservation_end = Some(end_time);
        listing.parking_space_status = ParkingSpaceStatus::Reserved;

        msg!("You reserved a listing, the parking space status is : {:?}", self.listing.parking_space_status);

        //msg homeowner that space is reserved
        //msg driver with reservation info, user story2B

      Ok(())
    }

    
}

#[error_code]
pub enum ErrorCode {
    #[msg("The listing is not available for reservation.")]
    ListingNotAvailable,
}