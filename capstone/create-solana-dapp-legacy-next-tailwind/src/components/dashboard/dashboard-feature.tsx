import { AppHero } from '@/components/app-hero'

const links: { label: string; href: string }[] = [
  { label: 'Solana Docs', href: 'https://docs.solana.com/' },
  { label: 'Solana Faucet', href: 'https://faucet.solana.com/' },
  { label: 'Solana Cookbook', href: 'https://solana.com/developers/cookbook/' },
  { label: 'Solana Stack Overflow', href: 'https://solana.stackexchange.com/' },
  { label: 'Solana Developers GitHub', href: 'https://github.com/solana-developers/' },
]

export function DashboardFeature() {
  return (
    <div className="bg-gray-800">
      <AppHero title="Panorama Parking" subtitle="gm" />
      <main className="max-w-4xl mx-auto p-6">
        <section className="mt-10">
          <h2 className="text-2xl font-bold text-white">Parking Challenges in Los Angeles</h2>
          <p className="mt-4 text-gray-300">
            In the bustling streets of Los Angeles, drivers often find themselves grappling with the daunting challenge of locating parking in densely populated neighborhoods. The struggle is compounded by the exorbitant fees charged at parking facilities, which can quickly add up and strain budgets. As a result, countless hours are wasted as frustrated motorists circle blocks in search of an elusive parking spot, turning what should be a simple task into a time-consuming ordeal.
          </p>
        </section>

        <section className="mt-10 bg-gray-700 p-4 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-white">Introducing Panorama Parking</h2>
          <p className="mt-4 text-gray-300">
            Our app bridges the gap between homeowners with extra parking spaces and drivers looking for convenient parking options. We leverage advanced LoRaWAN sensors to monitor the availability of parking spots in real-time, and transactions are securely managed through smart contracts on the Solana blockchain, ensuring a seamless experience for all users.
          </p>
        </section>

        <section className="mt-10 bg-gray-700 p-4 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-white">Key Features</h2>
          <ul className="mt-4 space-y-2 text-gray-300">
            <li><strong>Real-Time Availability:</strong> Sensors provide up-to-date information on parking space status.</li>
            <li><strong>Reservation System:</strong> Drivers can reserve parking spaces in advance for added convenience.</li>
            <li><strong>Data Ownership:</strong> Users maintain control over their data and have the option to monetize it.</li>
          </ul>
        </section>
      </main>

      <footer className="mt-10 p-4 text-center text-gray-400">
        <p>&copy; {new Date().getFullYear()} Panorama Parking. All rights reserved.</p>
      </footer>

      <div className="max-w-xl mx-auto py-6 sm:px-6 lg:px-8 text-center">
        <h3 className="text-lg font-semibold text-white">Helpful Links for Developers</h3>
        <div className="space-y-2 mt-4">
          {links.map((link, index) => (
            <div key={index}>
              <a
                href={link.href}
                className="hover:text-gray-500 dark:hover:text-gray-300"
                target="_blank"
                rel="noopener noreferrer"
              >
                {link.label}
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
