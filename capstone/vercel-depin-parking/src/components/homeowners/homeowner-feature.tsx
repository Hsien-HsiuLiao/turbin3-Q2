'use client'

import { useWalletUi } from '@wallet-ui/react';
//import { useWallet } from '@solana/wallet-adapter-react'; //crud example
import { WalletButton } from '../solana/solana-provider';
//import { AppHero, ellipsify } from '../ui/ui-layout'; //crud example
import { AppHero } from '../app-hero'
import { ellipsify } from '@/lib/utils'
import { ExplorerLink } from '../cluster/cluster-ui';
//import { useJournalProgram } from './journal-data-access';
//import { JournalCreate, JournalList } from './journal-ui';




export default function HomeownerFeature() {
 // const { publicKey } = useWallet();
  const { account } = useWalletUi()


  const { programId } = useJournalProgram();

  return account ? (
    <div>
      <AppHero
        title="My Solana Journal"
        subtitle={
          'Create your journal here!'
        }
      >
        <p className="mb-6">
          <ExplorerLink
            path={`account/${programId}`}
            label={ellipsify(programId.toString())}
          />
        </p>
        <JournalCreate />
      </AppHero>
      <JournalList />
    </div>
  ) : (
    <div className="max-w-4xl mx-auto">
      <div className="hero py-[64px]">
        <div className="hero-content text-center">
          <WalletButton />
        </div>
      </div>
    </div>
  );
}