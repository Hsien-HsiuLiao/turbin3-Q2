import { NextRequest, NextResponse } from 'next/server'
import { Connection, PublicKey, Transaction } from '@solana/web3.js'
import { getMarketplaceProgram } from '../../../util/marketplace-exports'
import { AnchorProvider } from '@coral-xyz/anchor'

// In-memory storage for pending transactions (in production, use a database)
const pendingTransactions = new Map<string, {
  id: string
  type: 'arrival' | 'leaving'
  transaction: string
  createdAt: string
  signedBy: string[]
  requiredSigners: string[]
  listingAddress: string
}>()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, transactionId, base64Transaction, account, maker, feed, type } = body
    
    console.log('API received request:', { action, transactionId, account, maker, type })

    // Initialize connection and program
    const connection = new Connection(process.env.NEXT_PUBLIC_RPC_URL || 'https://api.devnet.solana.com')
    const provider = new AnchorProvider(connection, {} as any, { commitment: 'confirmed' })
    const program = getMarketplaceProgram(provider)

    if (action === 'create') {
      // Create a new pending transaction
      const id = `${Date.now()}-${Math.random()}`
      console.log('Creating transaction with ID:', id)
      
      const listingData = await program.account.listing.fetch(new PublicKey(account))
      const renter = listingData.reservedBy
      
      console.log('Listing data:', { maker: listingData.maker.toString(), renter: renter?.toString() })
      
      if (!renter) {
        console.log('No renter found for listing')
        return NextResponse.json({ error: 'No renter found for this listing' }, { status: 400 })
      }

      const requiredSigners = [maker, renter.toString()]
      console.log('Required signers:', requiredSigners)
      
      pendingTransactions.set(id, {
        id,
        type,
        transaction: base64Transaction,
        createdAt: new Date().toISOString(),
        signedBy: [maker], // First signer
        requiredSigners,
        listingAddress: account
      })

      console.log('Transaction stored. Total pending transactions:', pendingTransactions.size)

      return NextResponse.json({ 
        success: true, 
        transactionId: id,
        message: `Transaction created! Waiting for ${type === 'arrival' ? 'renter' : 'maker'} signature.`
      })

    } else if (action === 'sign') {
      // Sign an existing transaction
      const pendingTx = pendingTransactions.get(transactionId)
      if (!pendingTx) {
        return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
      }

      // Update the transaction with the new signature
      pendingTx.transaction = base64Transaction
      pendingTx.signedBy.push(maker)

      // Check if all required signers have signed
      const allSigned = pendingTx.requiredSigners.every(signer => 
        pendingTx.signedBy.includes(signer)
      )

      if (allSigned) {
        // Send the transaction
        const transaction = Transaction.from(Buffer.from(base64Transaction, 'base64'))
        const signature = await connection.sendRawTransaction(
          transaction.serialize(),
          {
            skipPreflight: false,
            preflightCommitment: 'confirmed'
          }
        )

        // Remove from pending transactions
        pendingTransactions.delete(transactionId)

        return NextResponse.json({ 
          success: true, 
          signature,
          message: `${pendingTx.type === 'arrival' ? 'Car arrival' : 'Driver leaving'} simulation completed!`
        })
      } else {
        return NextResponse.json({ 
          success: true, 
          message: 'Transaction signed! Waiting for other signer.'
        })
      }

    } else if (action === 'list') {
      // List all pending transactions
      const transactions = Array.from(pendingTransactions.values())
      console.log('Listing transactions:', transactions.length, 'found')
      return NextResponse.json({ transactions })

    } else if (action === 'remove') {
      // Remove a pending transaction
      pendingTransactions.delete(transactionId)
      return NextResponse.json({ success: true, message: 'Transaction removed' })

    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

  } catch (error) {
    console.error('Multi-sig API error:', error)
    return NextResponse.json({ 
      error: `Server error: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 })
  }
} 