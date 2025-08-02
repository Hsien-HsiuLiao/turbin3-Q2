import { PublicKey } from "@solana/web3.js";
import { useMarketplaceProgram } from "../drivers/driver-data-access";
import { useWallet } from "@solana/wallet-adapter-react";
import { useTransactionToast } from '../use-transaction-toast';
import { toast } from 'sonner';

interface SensorChangeButtonProps {
  account: PublicKey;
  maker: PublicKey;
  feed: PublicKey;
}

export function SensorChangeButton({ account, maker, feed }: SensorChangeButtonProps) {
  const { program } = useMarketplaceProgram();
  const { publicKey } = useWallet();
  const transactionToast = useTransactionToast();

  const simulateSensorChange = async () => {
    if (!publicKey) {
      toast.error('Please connect your wallet');
      return;
    }

    console.log('Starting sensor change simulation...');
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
        listing: listing.toString(),
        feed: feed.toString()
      });

      console.log('Simulating sensor change for:', {
        account: account.toString(),
        maker: maker.toString(),
        feed: feed.toString(),
        marketplace: marketplace.toString(),
        listing: listing.toString()
      });

      const signature = await program.methods
        .sensorChange()
        .accountsPartial({
          feed,
          marketplace: marketplace,
          maker: maker,
          listing: listing,
          renter: publicKey,
        })
        .signers([])
        .rpc();

      transactionToast(signature);
      toast.success('Sensor change simulated successfully!');
      
    } catch (error) {
      console.error('Sensor change simulation failed:', error);
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
      toast.error(`Failed to simulate sensor change: ${(error as any).message}`);
    }
  };

  const handleSensorChange = () => {
    simulateSensorChange();
  };

  return (
    <button
      className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-200"
      onClick={handleSensorChange}
    >
      Simulate sensor change by car
    </button>
  );
} 