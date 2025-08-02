'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { 
  useSystemStatus, 
  useFeedManagement, 
  useAddFeed, 
  useSystemHealthCheck, 
  useEmergencyPause 
} from './admin-data-access'
import { useState } from 'react'
import { FeedAccountData } from './admin-feed-data'

export function AdminDashboard() {
  const { publicKey } = useWallet()
  const systemStatus = useSystemStatus()
  const feedManagement = useFeedManagement()
  const addFeed = useAddFeed()
  const healthCheck = useSystemHealthCheck()
  const emergencyPause = useEmergencyPause()
  
  const [newFeedAddress, setNewFeedAddress] = useState('')
  const [newFeedDescription, setNewFeedDescription] = useState('')

  const handleAddFeed = () => {
    if (newFeedAddress && newFeedDescription) {
      addFeed.mutate({
        feedAddress: newFeedAddress,
        description: newFeedDescription
      })
      setNewFeedAddress('')
      setNewFeedDescription('')
    }
  }

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-white">Admin Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Feed Management Section */}
          <div className="bg-white p-6 rounded-lg shadow-md border">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Feed Management</h2>
            <p className="text-gray-800 mb-4">Manage Switchboard oracle feeds for the parking marketplace.</p>
            
            {/* Add New Feed Form */}
            <div className="space-y-3 mb-4">
              <input
                type="text"
                placeholder="Feed Address"
                value={newFeedAddress}
                onChange={(e) => setNewFeedAddress(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-700"
              />
              <input
                type="text"
                placeholder="Description"
                value={newFeedDescription}
                onChange={(e) => setNewFeedDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-700"
              />
              <button
                className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors disabled:opacity-50"
                onClick={handleAddFeed}
                disabled={addFeed.isPending || !newFeedAddress || !newFeedDescription}
              >
                {addFeed.isPending ? 'Adding...' : 'Add New Feed'}
              </button>
            </div>

            {/* Current Feeds */}
            {feedManagement.data && (
              <div className="mt-4">
                <h3 className="font-semibold mb-2 text-gray-900">Current Feeds:</h3>
                <div className="space-y-2">
                  {feedManagement.data.feeds.map((feed, index) => (
                    <div key={index} className="text-sm p-2 bg-gray-50 rounded">
                      <div className="font-mono text-xs text-gray-900">{feed.address}</div>
                      <div className="text-gray-800">{feed.description}</div>
                      <div className={`text-xs ${feed.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                        {feed.status}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* System Status */}
          <div className="bg-white p-6 rounded-lg shadow-md border">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">System Status</h2>
            {systemStatus.isLoading ? (
              <div className="text-gray-800">Loading...</div>
            ) : systemStatus.data ? (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-800">Status:</span>
                  <span className={`font-semibold ${
                    systemStatus.data.status === 'operational' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {systemStatus.data.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-800">Connected Wallet:</span>
                  <span className="font-mono text-sm text-gray-900">{publicKey?.toString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-800">Admin Status:</span>
                  <span className="text-green-600 font-semibold">✓ Authorized</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-800">Last Check:</span>
                  <span className="text-sm text-gray-900">{new Date(systemStatus.data.lastCheck).toLocaleString()}</span>
                </div>
                
                {/* System Stats */}
                <div className="mt-4 pt-4 border-t">
                  <h4 className="font-semibold mb-2 text-gray-900">System Stats:</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-gray-900">Feeds: {systemStatus.data.feeds.total}</div>
                    <div className="text-gray-900">Active: {systemStatus.data.feeds.active}</div>
                    <div className="text-gray-900">Listings: {systemStatus.data.listings.total}</div>
                    <div className="text-gray-900">Reserved: {systemStatus.data.listings.reserved}</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-red-600">Error loading system status</div>
            )}
          </div>
          
          {/* Quick Actions */}
          <div className="bg-white p-6 rounded-lg shadow-md border">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Quick Actions</h2>
            <div className="space-y-3">
              <button
                className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors disabled:opacity-50"
                onClick={() => healthCheck.mutate()}
                disabled={healthCheck.isPending}
              >
                {healthCheck.isPending ? 'Checking...' : 'System Health Check'}
              </button>
              <button
                className="w-full bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition-colors disabled:opacity-50"
                onClick={() => {
                  if (confirm('Are you sure you want to perform an emergency pause?')) {
                    emergencyPause.mutate()
                  }
                }}
                disabled={emergencyPause.isPending}
              >
                {emergencyPause.isPending ? 'Pausing...' : 'Emergency Pause'}
              </button>
            </div>

            {/* Health Check Results */}
            {healthCheck.data && (
              <div className="mt-4 p-3 bg-gray-50 rounded">
                <h4 className="font-semibold mb-2 text-gray-900">Last Health Check:</h4>
                <div className="space-y-1 text-sm">
                  {Object.entries(healthCheck.data.checks).map(([check, status]) => (
                    <div key={check} className="flex justify-between">
                      <span className="capitalize text-gray-900">{check}:</span>
                      <span className={status === 'ok' ? 'text-green-600' : 'text-yellow-600'}>
                        {status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Feed Account Data */}
        <div className="mt-8">
          <FeedAccountData />
        </div>
        
        {/* Admin Info */}
        <div className="mt-8 bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Admin Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-semibold text-gray-900">Admin Wallet:</span>
              <span className="font-mono ml-2 text-gray-900">{publicKey?.toString()}</span>
            </div>
            <div>
              <span className="font-semibold text-gray-900">Network:</span>
              <span className="ml-2 text-gray-900">Devnet</span>
            </div>
            <div>
              <span className="font-semibold text-gray-900">Access Level:</span>
              <span className="ml-2 text-green-600">Full Admin</span>
            </div>
            <div>
              <span className="font-semibold text-gray-900">Last Login:</span>
              <span className="ml-2 text-gray-900">{new Date().toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 