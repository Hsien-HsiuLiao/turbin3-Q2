'use client'

import { SensorSimulationUI } from './sensor-simulation-ui';
import { ChangeEvent, useState } from 'react';

export default function SensorSimulationFeature() {
  const [searchTerm, setSearchTerm] = useState('');

  // Function to handle input change
  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  return (
    <div className="hero py-16 bg-black">
      <div className="hero-content text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Sensor Simulation Dashboard</h1>
        <p className="text-lg text-gray-300">Simulate parking sensor events and monitor system status.</p>
      </div>

      <div className="flex flex-col items-center mb-6">
        <input
          type="text"
          placeholder="Search for parking spaces..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="px-4 py-2 w-80 rounded bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
      </div>

      <div className="flex flex-col items-center">
        <SensorSimulationUI searchTerm={searchTerm} />
      </div>
    </div>
  );
} 