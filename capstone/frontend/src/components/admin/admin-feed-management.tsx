'use client'

import { useState } from 'react'
import { useFeedManagement, useAddFeed } from './admin-data-access'

export function AdminFeedManagement() {
  const feedManagement = useFeedManagement()
  const addFeed = useAddFeed()
  const [newFeedAddress, setNewFeedAddress] = useState('')

  const handleAddFeed = () => {
    if (newFeedAddress) {
      addFeed.mutate({
        feedAddress: newFeedAddress,
        description: 'Added via admin dashboard'
      })
      setNewFeedAddress('')
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
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-700"
        />
        <button
          className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors disabled:opacity-50"
          onClick={handleAddFeed}
          disabled={addFeed.isPending || !newFeedAddress}
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
  )
} 