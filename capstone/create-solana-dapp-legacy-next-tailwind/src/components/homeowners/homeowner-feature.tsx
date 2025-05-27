'use client'

//import { useWalletUi } from '@wallet-ui/react';
import { useWallet } from '@solana/wallet-adapter-react'; //crud example
import { WalletButton } from '../solana/solana-provider';
//import { AppHero, ellipsify } from '../ui/ui-layout'; //crud example
import { AppHero } from '../app-hero'
import { ellipsify } from '@/lib/utils'
import { ExplorerLink } from '../cluster/cluster-ui';
//import { useJournalProgram } from './journal-data-access';
import { useMarketplaceProgram } from './homeowner-data-access';

//import { JournalCreate, JournalList } from './journal-ui';
import {ListingCreate} from './homeowner-ui';
//import { useWalletUiCluster } from '@wallet-ui/react';




export default function HomeownerFeature() {
  const { publicKey } = useWallet();
  //const { account } = useWalletUi()
  //  const { cluster } = useWalletUiCluster()


  const { programId } = useMarketplaceProgram();

  return publicKey ? (
    <div>
      <AppHero
        title="Welcome Homeowners"
        subtitle={
          'Create your parking space listing here!'
        }
      >
        <p className="mb-6">
          <ExplorerLink
                    path={`account/${programId}`}
         /*    cluster="devnet"
            address={programId.toString()}  */
            label={ellipsify(programId.toString())}
          />
        </p>
          <ListingCreate />
      </AppHero>
      {/*  <JournalList /> */}
    </div>
  ) : (
    <div className="max-w-4xl mx-auto">
      <div className="hero py-[64px]">
        <div className="hero-content text-center">
          Before you can continue, please connect a wallet to create a listing
          <WalletButton />
        </div>
      </div>
    </div>
  );
}