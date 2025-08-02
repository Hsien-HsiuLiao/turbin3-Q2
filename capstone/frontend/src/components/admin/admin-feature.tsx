'use client'

import { useAdminWallet } from './admin-data-access'
import { AdminDashboard } from './admin-ui'

export function AdminFeature() {
  const { isAdmin, currentWallet } = useAdminWallet()

  // If not admin, show access denied
  if (!isAdmin) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-red-600">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access admin functions.</p>
          {currentWallet && (
            <p className="text-sm text-gray-500 mt-2">Connected wallet: {currentWallet}</p>
          )}
        </div>
      </div>
    )
  }

  // Show admin dashboard
  return <AdminDashboard />
} 