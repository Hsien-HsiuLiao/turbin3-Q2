use anchor_lang::prelude::*;

mod instructions;
mod state;

declare_id!("G7G4byox21m78MTkm4DNnfpyqAWXiYEHZTuRcnmJFyJm");

#[program]
pub mod staking {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

