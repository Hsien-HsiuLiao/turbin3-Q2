use anchor_lang::prelude::*;

use anchor_spl::token_interface::{Mint, TokenInterface};

use crate::state::Marketplace;

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,
    #[account(
        init,
        payer = admin 
        seeds = [b"marketplace", name.as_bytes()], //make generic
        bump, 
        space = Marketplace::INIT_SPACE
    )]
    pub marketplace: Account<'info, Marketplace>,
    #[account(
        seeds = [b"tresury", marketplace.key.as_ref()], //make a little generic so people can find it
        bump
    )]
    pub treasury: SystemAccount<'info>, //why SystemAccount? take lamports as fee, account owned by marketplace

    #[account(
        init, 
        payer = admin,
        seeds = [b"rewards", marketplace.key.as_ref()],
        bump, 
        mint::decimals = 6, 
        mint::authority = marketplace

    )]
    pub rewards_mint: InterfaceAccount<'info, Mint>,  
    pub system_program: Program<'info, System>,
    pub token_program: Interface<'info, TokenInterface>

}