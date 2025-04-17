#![allow(unexpected_cfgs)]

use anchor_lang::prelude::*;


mod instructions;
mod state;

use instructions::*;
use state::*;


declare_id!("FXUQwDsKJNrYFsfiUokPbH4BSrZtoC9m8HpoiMvYxtSE");

#[program]
pub mod marketplace {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, name: String, fee:u16) -> Result<()> {
        ctx.accounts.init(name, fee, &ctx.bumps)?;
        Ok(())
    }

    pub fn list(ctx: Context<List>, price: u64) -> Result<()> {
        ctx.accounts.create_listing(price, &ctx.bumps)?;
        ctx.accounts.deposit_nft()?;
        Ok(())
    }

    /* pub fn purchase(ctx: Context<Purchase>, ) -> Result<()> {
        
        Ok(())
    } */
}

//get marketplace pda, pda will save configuration for marketplace (admin, fee, ...)
