use anchor_lang::prelude::*;

declare_id!("7PHpxPwkoM3VaTjvBTz3qKUBKZprGWzQ7mnJKF9c7nNN");

#[program]
pub mod amm {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
