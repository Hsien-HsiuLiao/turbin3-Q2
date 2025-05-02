#![allow(unexpected_cfgs)]

use anchor_lang::prelude::*;


mod instructions;
mod state;

use instructions::*;


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
        Ok(())
    }

    pub fn reserve(ctx: Context<Reserve>, duration: u64) -> Result<()> {
        ctx.accounts.reserve_listing(duration)?;
        Ok(())
    }

    //pub fn sensor_change() { //when driver arrives or leaves}

    //pub fn confirm_parking() {//driver scans QR code to confirm arrival and parking}


}

//get marketplace pda, pda will save configuration for marketplace (admin, fee, ...)
