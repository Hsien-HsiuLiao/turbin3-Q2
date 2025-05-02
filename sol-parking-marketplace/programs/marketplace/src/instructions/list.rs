use anchor_lang::{prelude::*,  system_program::Transfer};

/* use anchor_spl::{associated_token::AssociatedToken, 
    metadata::{MasterEditionAccount, Metadata, MetadataAccount}, 
     
    token_interface::{Mint, TokenAccount, TokenInterface, transfer_checked, TransferChecked}}; */

use crate::state::{Listing, Marketplace};

#[derive(Accounts)]
#[instruction(sensor_id: u64)]
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
        seeds = [marketplace.key().as_ref(), &sensor_id.to_le_bytes()], //listing sensor_id

        bump,
        space = 8 + Listing::INIT_SPACE
    )]
    pub listing: Account<'info, Listing>, //

    
    
    pub system_program: Program<'info, System>,

}

impl <'info> List<'info> {
    pub fn create_listing(&mut self, price: u64, bumps: &ListBumps) -> Result<()> {
        self.listing.set_inner(Listing { 
            maker: self.maker.key(), 
        //    mint: self.maker_mint.key(), 
            price, 
            bump: bumps.listing,
            address: todo!(),
            rental_rate: todo!(),
            sensor_id: todo!(),
            reserved_by: todo!(),
            reservation_duration: todo!(),
            parking_space_status: todo!(), 
        });

      

        
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