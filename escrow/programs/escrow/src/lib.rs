#![allow(unexpected_cfgs)]
use anchor_lang::prelude::*;

mod instructions;
use instructions::*;
mod state;

declare_id!("CLe5CJoAo3YYRwgsQsAmPokqKHAw7XF9dJNCBvW25QCL");

#[program]
pub mod escrow {
    use super::*;

    pub fn make(ctx: Context<Make>, seed: u64, receive: u64, deposit: u64) -> Result<()> {
        ctx.accounts.init_escrow(seed, receive, &ctx.bumps)?;
        ctx.accounts.deposit(deposit)?;
        Ok(())
    }

    pub fn take(ctx: Context<Take>, seed: u64, receive: u64, deposit: u64) -> Result<()> {
        ctx.accounts.deposit()?;
//        ctx.accounts.withdraw_and_close()?;
        Ok(())
    }
}
