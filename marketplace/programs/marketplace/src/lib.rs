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

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

//get markeetplace pda, pda will save configuration for marketplace (admin, fee, ...)
