use anchor_lang::prelude::*;

declare_id!("A8q87wCYFZjR61Xjr34kcbxHSeoWUr2bZcLRMwLUDwrN");

#[program]
pub mod sol_parking {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
