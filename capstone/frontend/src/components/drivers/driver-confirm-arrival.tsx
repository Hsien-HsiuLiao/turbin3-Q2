import { PublicKey } from "@solana/web3.js";
import { useMarketplaceProgram } from "./driver-data-access";
import { useWallet } from "@solana/wallet-adapter-react";
import { useTransactionToast } from '../use-transaction-toast';
import { toast } from 'sonner';
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

interface ConfirmArrivalButtonProps {
  account: PublicKey;
  maker: PublicKey;
  sensorId: string;
}

export function ConfirmArrivalButton({ account, maker, sensorId }: ConfirmArrivalButtonProps) {
  const { program } = useMarketplaceProgram();
  const { publicKey } = useWallet();
  const transactionToast = useTransactionToast();

  const confirmParking = async () => {
    if (!publicKey) {
      toast.error('Please connect your wallet');
      return;
    }

    console.log('Starting confirm parking process...');
    console.log('Current user public key:', publicKey.toString());

    try {
      // Find marketplace PDA
      const marketplace_name = "DePIN PANORAMA PARKING";
      const [marketplace] = PublicKey.findProgramAddressSync(
        [Buffer.from("marketplace"), Buffer.from(marketplace_name)],
        program.programId
      );

      // Find listing PDA
      const [listing] = PublicKey.findProgramAddressSync(
        [marketplace.toBuffer(), maker.toBuffer()],
        program.programId
      );

      console.log('PDAs derived:', {
        marketplace: marketplace.toString(),
        listing: listing.toString()
      });

      // Get the listing data to check sensor ID and calculate transfer amount
      const listingData = await program.account.listing.fetch(listing);
      
      console.log('Listing data fetched:', {
        reservedBy: listingData.reservedBy?.toString(),
        sensorId: listingData.sensorId,
        currentUser: publicKey.toString()
      });
      
      // Log reservation times for debugging
      console.log('Reservation times:', {
        reservationStart: listingData.reservationStart?.toString(),
        reservationEnd: listingData.reservationEnd?.toString(),
        reservationStartDate: listingData.reservationStart ? new Date(Number(listingData.reservationStart) * 1000).toISOString() : 'N/A',
        reservationEndDate: listingData.reservationEnd ? new Date(Number(listingData.reservationEnd) * 1000).toISOString() : 'N/A',
        durationSeconds: listingData.reservationEnd && listingData.reservationStart ? Number(listingData.reservationEnd) - Number(listingData.reservationStart) : 'N/A',
        durationHours: listingData.reservationEnd && listingData.reservationStart ? (Number(listingData.reservationEnd) - Number(listingData.reservationStart)) / 3600 : 'N/A'
      });
      
      // Check if the current user is the one who reserved this parking space
      if (listingData.reservedBy?.toString() !== publicKey.toString()) {
        toast.error('Only the person who reserved this parking space can confirm arrival');
        console.error('Reservation mismatch:', {
          reservedBy: listingData.reservedBy?.toString(),
          currentUser: publicKey.toString()
        });
        return;
      }
      
      console.log('Reservation check passed');
      
      // Check if sensor ID matches
      if (listingData.sensorId !== sensorId) {
        toast.error(`Sensor ID mismatch. Expected: ${listingData.sensorId}, Provided: ${sensorId}`);
        return;
      }

      console.log('Sensor ID check passed');

      // Calculate expected transfer amount
      const duration = Number(listingData.reservationEnd) - Number(listingData.reservationStart);
      const ratePerHour = Number(listingData.rentalRate);
      const reservationAmount = Math.floor((duration / 3600) * ratePerHour);
      
      // Get marketplace data to get the fee
      const marketplaceData = await program.account.marketplace.fetch(marketplace);
      const marketplaceFee = Number(marketplaceData.fee);
      
      console.log('Marketplace data:', {
        marketplace: marketplace.toString(),
        fee: marketplaceData.fee.toString(),
        feeLamports: Number(marketplaceData.fee),
        feeSOL: Number(marketplaceData.fee) / LAMPORTS_PER_SOL
      });
      
      // Check if marketplace fee is 0, which might cause issues
      if (marketplaceFee === 0) {
        console.warn('Marketplace fee is 0 - this might cause transfer issues');
        toast.warning('Marketplace fee is 0 - this might cause issues with the transaction');
      }
      
      const totalAmount = reservationAmount + marketplaceFee;

      console.log('Transfer calculation:', {
        duration,
        ratePerHour: ratePerHour / LAMPORTS_PER_SOL,
        reservationAmount: reservationAmount / LAMPORTS_PER_SOL,
        marketplaceFee: marketplaceFee / LAMPORTS_PER_SOL,
        totalAmount: totalAmount / LAMPORTS_PER_SOL
      });

      // Log the raw values that will be used in the Rust program
      console.log('Raw values for Rust program:', {
        durationSeconds: duration,
        ratePerHourLamports: ratePerHour,
        reservationAmountLamports: reservationAmount,
        marketplaceFeeLamports: marketplaceFee,
        totalAmountLamports: totalAmount,
        durationHours: duration / 3600,
        calculatedAmount: Math.floor((duration / 3600) * ratePerHour) + marketplaceFee
      });

      // Get driver's balance
      const connection = program.provider.connection;
      const driverBalance = await connection.getBalance(publicKey);

      console.log('Balance check:', {
        driverBalance: driverBalance / LAMPORTS_PER_SOL,
        totalAmount: totalAmount / LAMPORTS_PER_SOL,
        hasEnoughFunds: driverBalance >= totalAmount
      });

      console.log('Confirm parking details:', {
        account: account.toString(),
        maker: maker.toString(),
        sensorId,
        marketplace: marketplace.toString(),
        listing: listing.toString(),
        listingSensorId: listingData.sensorId,
        driverBalance: driverBalance / LAMPORTS_PER_SOL,
        totalAmount: totalAmount / LAMPORTS_PER_SOL,
        reservationAmount: reservationAmount / LAMPORTS_PER_SOL,
        marketplaceFee: marketplaceFee / LAMPORTS_PER_SOL,
        duration,
        ratePerHour: ratePerHour / LAMPORTS_PER_SOL
      });

      // Check if driver has enough SOL
      if (driverBalance < totalAmount) {
        toast.error(`Insufficient balance. Required: ${(totalAmount / LAMPORTS_PER_SOL).toFixed(4)} SOL, Available: ${(driverBalance / LAMPORTS_PER_SOL).toFixed(4)} SOL`);
        return;
      }

      console.log('Confirming parking for:', {
        account: account.toString(),
        maker: maker.toString(),
        sensorId,
        marketplace: marketplace.toString(),
        listing: listing.toString()
      });

      const signature = await program.methods.confirmParking(sensorId)
        .accountsPartial({
          renter: publicKey,
          maker: maker,
          marketplace: marketplace,
          listing: listing,
        })
        .signers([]) // Add empty signers array like in the test
        .rpc();

      transactionToast(signature);
      toast.success('Parking confirmed successfully!');
      
    } catch (error) {
      console.error('Confirm parking failed:', error);
      // Log more detailed error information
      if ((error as any).logs) {
        console.error('Transaction logs:', (error as any).logs);
      }
      if ((error as any).error) {
        console.error('Error details:', (error as any).error);
      }
      // Try to get more detailed error information
      console.error('Full error object:', {
        message: (error as any).message,
        name: (error as any).name,
        stack: (error as any).stack,
        transactionMessage: (error as any).transactionMessage,
        transactionLogs: (error as any).transactionLogs,
        programErrorStack: (error as any).programErrorStack,
        errorLogs: (error as any).errorLogs,
        fullError: error
      });
      toast.error(`Failed to confirm parking: ${(error as any).message}`);
    }
  };

  const handleConfirmArrival = () => {
    confirmParking();
  };

  return (
    <button
      className="mt-4 w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition duration-200"
      onClick={handleConfirmArrival}
    >
      Confirm Arrival
    </button>
  );
}