import type { NextApiRequest, NextApiResponse } from 'next';

// Mock data 
const sensor_data = [
  { id: 1, sensor: 'DS20L', distance_in_cm: 20 },
];

// API route handler
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      // Handle GET request to fetch data
      return res.status(200).json(sensor_data);

 
      
    default:
      // Handle any other HTTP methods
      return res.status(405).json({ message: 'Method Not Allowed' });
  }
}