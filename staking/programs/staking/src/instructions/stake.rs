//1:04:00 video
use anchor_lang::prelude::*;

use anchor_spl::{
    metadata::{mpl_token_metadata::instructions::{FreezeDelegatedAccountCpi, FreezeDelegatedAccountCpiAccounts},
    MasterEditionAccount, 
    Metadata,
    MetadataAccount},
    token::{approve, Approve, Mint, Token, TokenAccount}
};
//add imports 1:17;00

use crate::state::StakeAccount;


#[derive(Accounts)]
pub struct Stake<'info> {

    #[account(mut)]
    pub user: Signer<'info>,
    pub mint: Account<'info, Mint>,
    pub collection_mint: Account<'info, Mint>,

    #[account(
        mut, 
        associated_token::mint = mint, 
        associated_token::authority = user
    )]
    pub mint_ata: Account<'info, TokenAccount>,

    #[account(
        seeds = [
            //standard seeds
            b"metadata",
            metadata_program.key().as_ref(),
            mint.key().as_ref()  //unique

        ],
        seeds::program = metadata_program.key(),
        bump, 
        constraint = metadata.collection.as_ref().unwrap().key.as_ref() == collection_mint.key().as_ref(),
        constraint = metadata.collection.as_ref().unwrap().verified,
    )]
    pub metadata: Account<'info, MetadataAccount>,
    #[account(
        seeds = [
            //standard seeds
            b"metadata",
            metadata_program.key().as_ref(),
            mint.key().as_ref(),
            b"edition",  

        ],
        seeds::program = metadata_program.key(),
        bump, 
    )]
    pub master_edition: Account<'info, MasterEditionAccount>,

    #[account(
        mut, //to account for nfts
        seeds = [b"user", user.key().as_ref()], 
        bump = user_account.bump, 
    )]
    pub user_account: Account<'info, UserAccount>,

    #[account(
        seeds = [b"config"],
        bump = config.bump, //why config.bump, because not init?
    )]
    pub config: Account<'info, StakeConfig>,

    #[account(
        init, 
        payer = user, 
        seeds = [b"stake", config.key().as_ref(), mint.key().as_ref()],
        bump, 
        space = 8 + StakeAccount::INIT_SPACE
    )]
    pub stake_account: Account<'info, StakeAccount>,
    pub metadata_program: Program<'info, Metadata>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>
}

impl <'info> Stake<'info> {
    pub fn stake(&mut self, bumps: &StakeBumps) -> Result<()>{

        assert!(self.user_account.amount_staked <= self.config.max_staked);

        let cpi_program = self.token_program.to_account_info();

        //give authority to stake_account
        let cpi_accounts = Approve{
            to: self.mint_ata.to_account_info(),
            delegate: self.stake_account.to_account_info(),
            authority: self.user.to_account_info(),//give authority to
        };

        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);

        //hover over approve and click on Approve
        //then at   line 100, go to definition for approve  let ix = spl_token::instruction::approve(
        //hover over Approve and read     let data = TokenInstruction::Approve { amount }.pack();


        approve(cpi_ctx, 1)?;
        //end give authority to stake_account

        let delegate = &self.stake_account.to_account_info();
        let token_account = &self.mint_ata.to_account_info();
        let edition = &self.master_edition.to_account_info();
        let mint = &self.mint.to_account_info();
        let token_program = &self.token_program.to_account_info();
        let metadata = &self.metadata.to_account_info();

        let seeds = &[
            b"stake",
            self.config.to_account_info(),
            self.mint.to_account_info(),
            &[self.stake_account.bump]
        ];

        let signer_seeds = &[&seeds[..]];

        //use authority to freeze token account
        FreezeDelegatedAccountCpi::new(
            metadata, 
            FreezeDelegatedAccountCpiAccounts { 
                delegate, 
                token_account, 
                edition, 
                mint,
                token_program
            }
        ).invoke_signed(signer_seeds);

        self.stake_account.set_inner(StakeAccount { 
            owner: self.user.key(), 
            mint: self.mint.key(), 
            staked_at: Clock::get()?.unix_timestamp, 
            bump: bumps.stake_account 
        });

        self.user_account.amount_staked += 1;
        //1:35:00 discussion delegate vs freeze
        
        Ok(())
    }
}