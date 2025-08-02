'use client'

import { useState } from 'react'
import { useFeedManagement, useAddFeed } from './admin-data-access'

export function AdminFeedManagement() {
  const feedManagement = useFeedManagement()
  const addFeed = useAddFeed()
  const [newFeedAddress, setNewFeedAddress] = useState('')
  const [newMakerAddress, setNewMakerAddress] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleAddFeed = () => {
    if (newFeedAddress && newMakerAddress) {
      setError(null) // Clear previous errors
      addFeed.mutate({
        feedAddress: newFeedAddress,
        makerAddress: newMakerAddress,
        description: 'Added via admin dashboard'
      }, {
        onSuccess: () => {
          setNewFeedAddress('')
          setNewMakerAddress('')
        },
        onError: (error) => {
          setError(error.message)
        }
      })
    }
  }

  return (
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
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-700 text-gray-900"
        />
        <input
          type="text"
          placeholder="Maker Address"
          value={newMakerAddress}
          onChange={(e) => setNewMakerAddress(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-700 text-gray-900"
        />
        <button
          className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors disabled:opacity-50"
          onClick={handleAddFeed}
          disabled={addFeed.isPending || !newFeedAddress || !newMakerAddress}
        >
          {addFeed.isPending ? 'Adding...' : 'Add New Feed'}
        </button>
        
        {/* Error Display */}
        {error && (
          <div className="mt-3 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            <p className="text-sm font-medium">Error:</p>
            <p className="text-sm">{error}</p>
          </div>
        )}
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
  )
} 