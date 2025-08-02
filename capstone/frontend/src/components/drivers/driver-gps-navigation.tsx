'use client'

import { PublicKey } from '@solana/web3.js'

interface GpsNavigationButtonProps {
  address: string
  latitude: number
  longitude: number
}

export function GpsNavigationButton({ address, latitude, longitude }: GpsNavigationButtonProps) {
  const handleGpsNavigation = () => {
    // Check if we have valid GPS coordinates
    const hasValidCoordinates = latitude !== 0 && longitude !== 0 && 
                               !isNaN(latitude) && !isNaN(longitude) &&
                               latitude >= -90 && latitude <= 90 &&
                               longitude >= -180 && longitude <= 180

    if (hasValidCoordinates) {
      // Use GPS coordinates for navigation (more accurate)
      const gpsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`
      window.open(gpsUrl, '_blank')
      console.log('Opening GPS navigation with coordinates:', { latitude, longitude })
    } else if (address && address.trim() !== '') {
      // Fallback to address-based navigation
      const addressUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`
      window.open(addressUrl, '_blank')
      console.log('Opening GPS navigation with address:', address)
    } else {
      alert('No valid location information available for navigation.')
    }
  }

  const getButtonText = () => {
    const hasValidCoordinates = latitude !== 0 && longitude !== 0 && 
                               !isNaN(latitude) && !isNaN(longitude) &&
                               latitude >= -90 && latitude <= 90 &&
                               longitude >= -180 && longitude <= 180

    if (hasValidCoordinates) {
      return `Navigate to GPS Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`
    } else if (address && address.trim() !== '') {
      return `Navigate to Address (${address.length > 30 ? address.substring(0, 30) + '...' : address})`
    } else {
      return 'Navigate (No location data)'
    }
  }

  const isDisabled = () => {
    const hasValidCoordinates = latitude !== 0 && longitude !== 0 && 
                               !isNaN(latitude) && !isNaN(longitude) &&
                               latitude >= -90 && latitude <= 90 &&
                               longitude >= -180 && longitude <= 180

    return !hasValidCoordinates && (!address || address.trim() === '')
  }

  return (
    <button
      onClick={handleGpsNavigation}
      disabled={isDisabled()}
      className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      title={isDisabled() ? 'No location data available' : 'Open GPS navigation'}
    >
      <div className="flex items-center justify-center gap-2">
        <svg 
          className="w-4 h-4" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" 
          />
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" 
          />
        </svg>
        {getButtonText()}
      </div>
    </button>
  )
} 