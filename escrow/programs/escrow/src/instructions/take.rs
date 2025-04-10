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
        init_if_needed, //if taker_ata_a doesn't exist, create it and taker will pay for transaction 
        payer = taker, 
/*         init_if_needed requires that anchor-lang be imported with the init-if-needed cargo feature enabled. 
Carefully read the init_if_needed docs before using this feature to make sure you know how to protect yourself 
against re-initialization attacks.rust-analyzer
 */        associated_token::mint = mint_a, 
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
    pub fn deposit(&mut self) -> Result<()> {
        let transfer_acccounts = TransferChecked {
            from: self.taker_ata_b.to_account_info(), //since we are transferring tokens 
            mint: self.mint_b.to_account_info(), 
            to: self.maker_ata_b.to_account_info(), 
            authority: self.taker.to_account_info()
        };

        let cpi_ctx = CpiContext::new(self.token_program.to_account_info(), transfer_acccounts);

        transfer_checked(cpi_ctx, self.escrow.receive, self.mint_b.decimals)?;

        
Ok(())
    }

  
}
