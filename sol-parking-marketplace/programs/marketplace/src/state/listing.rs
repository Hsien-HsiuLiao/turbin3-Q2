use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace, Debug)]
pub struct Listing {
    pub maker: Pubkey,
    pub bump: u8, 
    #[max_len(32)] 
    pub address: String,
    pub latitude:f64, 
    pub longitude:f64,
    pub rental_rate: u32, //per hour
    #[max_len(16)] 
    pub availabilty_start: String, 
    #[max_len(16)] 
    pub availabilty_end: String,
    #[max_len(8)] 
    pub sensor_id: String, 
    pub reserved_by: Option<Pubkey>, 
    pub reservation_duration: Option<u16>,
    pub parking_space_status:ParkingSpaceStatus, 
    
    #[max_len(32)]
    pub additional_info: Option<String>,
    //date/times avail
    pub feed: Option<Pubkey>
}

#[derive(Debug, Clone, Copy, AnchorSerialize, AnchorDeserialize, PartialEq)]
pub enum ParkingSpaceStatus {
    Available,
    Reserved,
    Occupied,
    UnAvailable
}

// Implement the Space trait for ParkingSpaceStatus
impl Space for ParkingSpaceStatus {
    //const LEN: usize = 1;
                                    // rust-analyer popup mentioned 42, trying 42
    // const INIT_SPACE: usize = 42; // Since we are using u8 representation
    const INIT_SPACE: usize = 1; 

}