use anchor_lang::prelude::*;

use anchor_spl::{associated_token::AssociatedToken, 
    metadata::{MasterEditionAccount, Metadata, MetadataAccount}, 
     
    token_interface::{Mint, TokenAccount, TokenInterface, transfer_checked, TransferChecked}};


use crate::state::{Listing, Marketplace};

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
        mut,
        associated_token::mint = maker_mint,
        associated_token::authority = listing
    )]
    pub vault: InterfaceAccount<'info, TokenAccount>,
    pub maker_mint: InterfaceAccount<'info, Mint>,

    pub system_program: Program<'info, System>,
    pub token_program: Interface<'info, TokenInterface>

}

impl <'info> Purchase<'info> {
    
}