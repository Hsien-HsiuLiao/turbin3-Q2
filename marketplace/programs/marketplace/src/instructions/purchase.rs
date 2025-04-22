use anchor_lang::{prelude::*, system_program::{Transfer, transfer}};

use anchor_spl::{associated_token::AssociatedToken, 
    metadata::{MasterEditionAccount, Metadata, MetadataAccount}, 
     
    token_interface::{Mint, TokenAccount, TokenInterface}};


use crate::{marketplace, state::{Listing, Marketplace}};

#[derive(Accounts)]
pub struct Purchase<'info> {
   #[account(mut)]
   pub taker: Signer<'info>,
   #[account(mut)]
   pub maker: SystemAccount<'info>, //why systemaccount
   
    #[account(
       
        seeds = [b"marketplace", marketplace.name.as_bytes()], //make generic
        bump, 
    )]
    pub marketplace: Account<'info, Marketplace>,


    #[account(
        init_if_needed, 
        payer = taker, 
        associated_token::mint = maker_mint,
        associated_token::authority = taker
    )]
    pub taker_ata: InterfaceAccount<'info, TokenAccount>,//receive nft while purchasing
    #[account(
        mut,
        seeds = [b"tresury", marketplace.key().as_ref()], //make a little generic so people can find it
        bump
    )]
    pub treasury: SystemAccount<'info>, //why SystemAccount? take lamports as fee, account owned by marketplace

    #[account(
        mut,
        seeds = [b"rewards", marketplace.key().as_ref()],
        bump = marketplace.rewards_bump, 
        mint::authority = marketplace

    )]
    pub rewards_mint: InterfaceAccount<'info, Mint>,  

    #[account(
        mut,
        seeds = [marketplace.key().as_ref(), maker_mint.key().as_ref()], //mint is unique
        bump,
        close = maker
    )]
    pub listing: Account<'info, Listing>,
    #[account(
        mut, //will need to move things
        associated_token::mint = maker_mint,
        associated_token::authority = listing
    )]
    pub vault: InterfaceAccount<'info, TokenAccount>,
    pub maker_mint: InterfaceAccount<'info, Mint>,
    pub associated_token_program: Program<'info, AssociatedToken>,

    pub system_program: Program<'info, System>,
    pub token_program: Interface<'info, TokenInterface>

}

impl <'info> Purchase<'info> {
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

        let cpi_ctx = CpiContext::new(cpi_program, cpi_account);

        let amount = 
        

        Ok(())
    }

    pub fn send_nft() -> Result<()> {
        Ok(())
    }

    pub fn close_mint_vault() -> Result<()> {
        Ok(())
    }
}