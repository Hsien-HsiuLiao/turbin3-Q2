use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken, token_interface::{transfer_checked, Mint, TokenAccount, TokenInterface, TransferChecked} };

use crate::state::Escrow;

#[derive(Accounts)]
#[instruction(seed: u64)]
pub struct Take<'info> {
    #[account(mut)]
    pub taker : Signer<'info>,

    #[account(mut)]
    pub maker: SystemAccount<'info>, //want to know maker is acct owned by system program, use maker to derive

    #[account(
        mint::token_program = token_program,

    )]
    pub mint_a: InterfaceAccount<'info, Mint>, //to derive ata

    #[account(
        mint::token_program = token_program,

    )]
    pub mint_b: InterfaceAccount<'info, Mint>, //to derive ata

    #[account(
mut, 
associated_token::mint = mint_b, 
associated_token::authority = maker, 
associated_token::token_program = token_program,
    )]
    pub maker_ata_b: InterfaceAccount<'info, TokenAccount>, //derive b ata

    #[account(
        mut, 
        associated_token::mint = mint_a, 
        associated_token::authority = taker, 
        associated_token::token_program = token_program,
            )]
    pub taker_ata_a: InterfaceAccount<'info, TokenAccount>, //transfer tokens into taker ata_a acct from vault

    #[account(
        mut, 
        associated_token::mint = mint_b, 
        associated_token::authority = taker, 
        associated_token::token_program = token_program,
            )]
    pub taker_ata_b: InterfaceAccount<'info, TokenAccount>, //transfer b tokens from taker to maker

    #[account(
        seeds = [b"maker", escrow.maker.key().as_ref(), escrow.seed.to_le_bytes().as_ref()], 
        bump = escrow.bump
    )]
    pub escrow: Account<'info, Escrow>,

    #[account(
        associated_token::mint = mint_a, 
        associated_token::authority = escrow, 
        associated_token::token_program = token_program
    )]
    pub vault: InterfaceAccount<'info, TokenAccount>, //like ata owned by escrow

    pub associated_token_program: Program<'info, AssociatedToken>,
    pub token_program: Interface<'info, TokenInterface>,
    pub system_program: Program<'info, System>
}

impl<'info> Take<'info> {
    pub fn init_escrow(&mut self, seed: u64, receive: u64, bumps: &MakeBumps) -> Result<()> {
        self.escrow.set_inner(Escrow{
            seed,
            maker: self.maker.key(), 
            mint_a: self.mint_a.key(), 
            mint_b: self.mint_b.key(),
            receive, 
            bump: bumps.escrow
        });
Ok(())
    }

    pub fn deposit(&mut self, deposit: u64) -> Result<()>{
        let transfer_acccounts = TransferChecked {
            from: self.maker_ata_a.to_account_info(), //since we are transferring tokens 
            mint: self.mint_a.to_account_info(), 
            to: self.vault.to_account_info(), 
            authority: self.maker.to_account_info()
        };

        let cpi_ctx = CpiContext::new(self.token_program.to_account_info(), accounts)?; //where does accounts come from?

        transfer_checked(cpi_ctx, deposit, self.mint_a.decimals)?;
        Ok(())

    }
}
