import type { NextApiRequest, NextApiResponse } from 'next';

// Mock data 
/* const sensor_data = [
  {
    "app_eui": "...",
    "dc": { "balance": 200, "nonce": 2 },
    "decoded": {
      "payload": {
        "BatV": 3.250, // Battery voltage in volts
        "Distance_cm": 150, // Distance in centumeters
        "distance_state": 1, // State of the distance measurement
        "Interrupt_count": 5, // Number of interrupts
        "Interrupt": 1, // Interrupt status (1: active, 0: inactive)
        "alarm": 0, // Alarm status (1: triggered, 0: not triggered)
        "MOD": 1, // Module type
        "DO": 1, // Digital output status
        "DO_Flag": 0, // Digital output flag
        "Threshold_Flag_for_Alarm": 1, // Threshold flag for alarm
        "Upper_limit": 200, // Upper limit value
        "lower_limit": 50 // Lower limit value
      },
      "status": "success"
    },
    "dev_eui": "...",
    "devaddr": "03000049",
    "downlink_url": "https://console.helium.com/api/v1/down/....",
    "fcnt": 54,
    "hotspots": [
      {
        "channel": 5,
        "frequency": 868.1,
        "hold_time": 0,
        "id": "???????",
        "lat": 35.2273574, 
        "long": -118.4500036,
        "name": "????-????-????",
        "reported_at": 1695491235713,
        "rssi": -130,
        "snr": -12.0,
        "spreading": "SF12BW125",
        "status": "success"
      }
    ],
    "id": "ID...",
    "metadata": {
      "adr_allowed": false,
      "cf_list_enabled": false,
      "multi_buy": 1,
      "organization_id": "ID...",
   //   "preferred_hotspots": [],
      "rx_delay": 1,
      "rx_delay_actual": 1,
      "rx_delay_state": "rx_delay_established"
    },
    "name": "Distance Detector",
    "payload": "DGYBAAAcAAAAAA==",
    "payload_size": 11,
    "port": 2,
    "raw_packet": "QAMAAEiANQAK5yx+wU+dOzSfMkpVL9c=",
    "replay": false,
    "reported_at": 1695491235713,
    "type": "uplink",
    "uuid": "id..."
  }
  ,
]; */

const sensor_data = [
  { id: 1, sensor: 'DS20L', distance_in_cm: 150 },
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