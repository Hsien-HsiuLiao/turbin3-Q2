import { PublicKey } from "@solana/web3.js";
import { useSensorSimulationProgram } from "./sensor-simulation-data-access";
import { useWallet } from "@solana/wallet-adapter-react";
import { useTransactionToast } from '../use-transaction-toast';
import { toast } from 'sonner';

interface SensorChangeButtonProps {
  account: PublicKey;
  maker: PublicKey;
  feed: PublicKey;
}

export function SensorChangeButton({ account, maker, feed }: SensorChangeButtonProps) {
  const { program } = useSensorSimulationProgram();
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
      if (error && typeof error === 'object' && 'logs' in error) {
        console.error('Transaction logs:', (error as { logs: unknown }).logs);
      }
      if (error && typeof error === 'object' && 'error' in error) {
        console.error('Error details:', (error as { error: unknown }).error);
      }
      // Try to get more detailed error information
      console.error('Full error object:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        name: error instanceof Error ? error.name : 'Unknown',
        stack: error instanceof Error ? error.stack : 'No stack trace',
        transactionMessage: error && typeof error === 'object' && 'transactionMessage' in error ? (error as { transactionMessage: unknown }).transactionMessage : 'N/A',
        transactionLogs: error && typeof error === 'object' && 'transactionLogs' in error ? (error as { transactionLogs: unknown }).transactionLogs : 'N/A',
        programErrorStack: error && typeof error === 'object' && 'programErrorStack' in error ? (error as { programErrorStack: unknown }).programErrorStack : 'N/A',
        errorLogs: error && typeof error === 'object' && 'errorLogs' in error ? (error as { errorLogs: unknown }).errorLogs : 'N/A',
        fullError: error
      });
      toast.error(`Failed to simulate sensor change: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
      Simulate car parking over sensor
    </button>
  );
} 