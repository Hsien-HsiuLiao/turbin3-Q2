use anchor_lang::{prelude::*, system_program::{Transfer, transfer}};

/* use anchor_spl::{associated_token::AssociatedToken, 
    metadata::{MasterEditionAccount, Metadata, MetadataAccount}, 
    token::{close_account, transfer_checked, CloseAccount, TransferChecked}, 
    token_interface::{Mint, TokenAccount, TokenInterface}}; */


use crate::{marketplace, state::{Listing, Marketplace}};

#[derive(Accounts)]
#[instruction(sensor_id: u64)]
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
//        seeds = [marketplace.key().as_ref(), maker_mint.key().as_ref()], //
        seeds = [marketplace.key().as_ref(), &sensor_id.to_le_bytes()], //

        bump,
        close = maker
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
    pub fn send_sol(&self) -> Result<()> {
      Ok(())
    }

    
    pub fn close(&mut self) -> Result<()> {
       
Ok(())

    }
}