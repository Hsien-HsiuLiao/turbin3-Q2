use anchor_lang::{prelude::*, system_program::{Transfer, transfer}};

use anchor_spl::{associated_token::AssociatedToken, metadata::{MasterEditionAccount, Metadata, MetadataAccount}, token::{close_account, transfer_checked, CloseAccount, TransferChecked}, token_interface::{Mint, TokenAccount, TokenInterface}};


use crate::{marketplace, state::{Listing, Marketplace}};

#[derive(Accounts)]
pub struct Rent<'info> {
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
        seeds = [marketplace.key().as_ref(), maker_mint.key().as_ref()], //mint is unique
        bump,
        close = maker
    )]
    pub listing: Account<'info, Listing>,   //authority to close mint vault
    #[account(
        mut, //will need to move things
        associated_token::mint = maker_mint,
        associated_token::authority = listing
    )]
    pub vault: InterfaceAccount<'info, TokenAccount>,
   

    pub system_program: Program<'info, System>,

}

impl <'info> Rent<'info> {
    pub fn send_sol(&self) -> Result<()> {
        let marketplace_fee = (self.marketplace.fee as u64)
            .checked_mul(self.listing.price)
            .unwrap()
            .checked_div(10000_u64)
            .unwrap();

        let cpi_program = self.system_program.to_account_info();

        let cpi_account = Transfer{
            from: self.taker.to_account_info(),
            to: self.maker.to_account_info(),
        };

        let cpi_ctx: CpiContext<'_, '_, '_, '_, Transfer<'_>> = CpiContext::new(cpi_program, cpi_account);

        let amount = self.listing.price.checked_sub(marketplace_fee).unwrap();

        transfer(cpi_ctx, amount)?;

        let cpi_program = self.system_program.to_account_info();

        let cpi_account = Transfer{
            from: self.taker.to_account_info(),
            to: self.treasury.to_account_info(),
        };

        let cpi_ctx: CpiContext<'_, '_, '_, '_, Transfer<'_>> = CpiContext::new(cpi_program, cpi_account);

        transfer(cpi_ctx, marketplace_fee)

    }

    
    pub fn close(&mut self) -> Result<()> {
       


    }
}