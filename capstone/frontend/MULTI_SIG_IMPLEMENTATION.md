# Multi-Signature Wallet Implementation for Sensor Simulation

## Overview

This implementation provides a comprehensive solution for handling multi-signature transactions in the Solana parking marketplace, specifically for the `sensorChange` instruction that requires both maker and renter signatures.

## Problem Solved

The original issue was that the `sensorChange` instruction requires both the `maker` (homeowner) and `renter` (driver) to sign the same transaction simultaneously. This cannot be achieved with sequential signing using wallet extensions due to the way Solana handles transaction signatures.

## Solution Architecture

### 1. Basic Multi-Signature Wallet (`multi-sig-wallet.tsx`)
- **Storage**: Client-side localStorage
- **Features**: 
  - Create transactions with first signature
  - Store pending transactions locally
  - Allow second signer to complete transactions
  - Basic error handling and validation

### 2. Enhanced Multi-Signature Wallet (`enhanced-multi-sig-wallet.tsx`)
- **Storage**: Backend API with server-side persistence
- **Features**:
  - Secure backend storage of transactions
  - Real-time polling for updates
  - Multi-user support
  - Comprehensive error handling
  - Transaction persistence across sessions

### 3. Backend API (`/api/multi-sig-transaction.ts`)
- **Purpose**: Server-side transaction management
- **Features**:
  - Create, sign, list, and remove transactions
  - Automatic transaction execution when all signatures are collected
  - In-memory storage (can be extended to database)

## How to Use

### Step 1: Access the Multi-Signature Interface
1. Navigate to the Sensor Simulation page
2. Find a parking space listing
3. Click "Show Multi-Signature Wallet"
4. Choose between "Basic" or "Enhanced" mode

### Step 2: Create a Transaction
1. Click "Create Car Arrival Transaction" or "Create Driver Leaving Transaction"
2. The first signer (current wallet) will sign the transaction
3. The transaction is stored (locally or server-side depending on mode)

### Step 3: Complete the Transaction
1. Switch to the second wallet (maker or renter, depending on who created it)
2. The pending transaction will be visible in the list
3. Click "Sign Transaction" to add the second signature
4. The transaction will automatically execute when both signatures are collected

## Technical Implementation Details

### Transaction Flow
```typescript
// 1. Create transaction with sensorChange instruction
const transaction = await program.methods
  .sensorChange()
  .accountsPartial({
    feed,
    marketplace,
    maker: listingData.maker,
    listing: account,
    renter: renter,
  })
  .transaction()

// 2. Sign with first wallet
const signedTransaction = await signTransaction(transaction)

// 3. Serialize and store
const serializedTransaction = signedTransaction.serialize({
  requireAllSignatures: false,
  verifySignatures: false
})

// 4. Second signer deserializes and signs
const transaction = Transaction.from(Buffer.from(base64Transaction, 'base64'))
const fullySignedTransaction = await signTransaction(transaction)

// 5. Execute transaction
const signature = await connection.sendRawTransaction(
  fullySignedTransaction.serialize()
)
```

### Key Features

#### Basic Mode
- ✅ Simple client-side implementation
- ✅ localStorage persistence
- ✅ Basic validation and error handling
- ❌ No multi-user support
- ❌ Transactions lost on page refresh

#### Enhanced Mode
- ✅ Server-side storage
- ✅ Real-time updates with polling
- ✅ Multi-user support
- ✅ Persistent across sessions
- ✅ Comprehensive error handling
- ✅ Automatic transaction execution

## API Endpoints

### POST `/api/multi-sig-transaction`

#### Create Transaction
```json
{
  "action": "create",
  "base64Transaction": "...",
  "account": "listing_public_key",
  "maker": "signer_public_key",
  "feed": "feed_public_key",
  "type": "arrival"
}
```

#### Sign Transaction
```json
{
  "action": "sign",
  "transactionId": "transaction_id",
  "base64Transaction": "...",
  "maker": "signer_public_key"
}
```

#### List Transactions
```json
{
  "action": "list"
}
```

#### Remove Transaction
```json
{
  "action": "remove",
  "transactionId": "transaction_id"
}
```

## Security Considerations

### Client-Side (Basic Mode)
- Transactions stored in localStorage (not secure for sensitive data)
- No server-side validation
- Vulnerable to client-side tampering

### Server-Side (Enhanced Mode)
- Transactions stored server-side
- Server validates signer authorization
- Better security but requires trusted backend

## Production Recommendations

### 1. Database Storage
Replace in-memory storage with a proper database:
```typescript
// Example with PostgreSQL
const pendingTransactions = await db.query(
  'INSERT INTO pending_transactions (id, type, transaction, signed_by, required_signers) VALUES ($1, $2, $3, $4, $5)',
  [id, type, base64Transaction, signedBy, requiredSigners]
)
```

### 2. Authentication
Add proper authentication to the API:
```typescript
// Verify wallet signature
const message = `Sign this message to authenticate: ${nonce}`
const signature = await wallet.signMessage(message)
const isValid = verifySignature(message, signature, publicKey)
```

### 3. Rate Limiting
Implement rate limiting to prevent abuse:
```typescript
import rateLimit from 'express-rate-limit'

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
})
```

### 4. Transaction Expiration
Add expiration to pending transactions:
```typescript
const EXPIRATION_TIME = 24 * 60 * 60 * 1000 // 24 hours

// Clean up expired transactions
setInterval(async () => {
  const expired = await db.query(
    'DELETE FROM pending_transactions WHERE created_at < NOW() - INTERVAL \'24 hours\''
  )
}, 60 * 60 * 1000) // Check every hour
```

## Alternative Solutions

### 1. Program Modification
Modify the Anchor program to allow single-signer operations:
```rust
// Instead of requiring both signatures, allow either:
#[account(mut)]
pub maker: Signer<'info>, // OR
#[account(mut)]
pub renter: Signer<'info>, // OR
```

### 2. Separate Instructions
Create different instructions for different scenarios:
```rust
pub fn sensor_change_by_maker(ctx: Context<SensorChangeByMaker>) -> Result<()> {
    // Only maker can call this
}

pub fn sensor_change_by_renter(ctx: Context<SensorChangeByRenter>) -> Result<()> {
    // Only renter can call this
}
```

### 3. Multi-Signature Program
Use Solana's built-in multi-signature program:
```typescript
import { createMultisig } from '@solana/spl-token'

const multisig = await createMultisig(
  connection,
  payer,
  [maker, renter],
  2, // Require 2 of 2 signatures
  multisigKey
)
```

## Testing

### Manual Testing
1. Create a transaction with wallet A
2. Switch to wallet B
3. Sign the pending transaction
4. Verify the transaction executes successfully

### Automated Testing
```typescript
describe('Multi-Signature Wallet', () => {
  it('should create and complete a transaction', async () => {
    // Test implementation
  })
  
  it('should reject unauthorized signers', async () => {
    // Test security
  })
  
  it('should handle transaction expiration', async () => {
    // Test cleanup
  })
})
```

## Troubleshooting

### Common Issues

1. **"Signature verification failed"**
   - Ensure both signers are authorized
   - Check that the transaction hasn't been modified
   - Verify the correct wallets are being used

2. **"Transaction not found"**
   - Refresh the transaction list
   - Check if the transaction was removed or expired
   - Verify the transaction ID is correct

3. **"You are not authorized to sign"**
   - Ensure you're using the correct wallet
   - Check that you're either the maker or renter
   - Verify the listing data is correct

### Debug Mode
Enable debug logging to troubleshoot issues:
```typescript
const DEBUG = process.env.NODE_ENV === 'development'

if (DEBUG) {
  console.log('Transaction details:', {
    signers: transaction.signatures,
    requiredSigners: pendingTx.requiredSigners,
    currentWallet: publicKey.toString()
  })
}
```

## Conclusion

This multi-signature wallet implementation provides a robust solution for handling transactions that require multiple signatures. The enhanced mode with backend storage is recommended for production use, while the basic mode is suitable for development and testing.

The implementation successfully addresses the original limitation of sequential signing and provides a user-friendly interface for managing multi-signature transactions in the parking marketplace. 