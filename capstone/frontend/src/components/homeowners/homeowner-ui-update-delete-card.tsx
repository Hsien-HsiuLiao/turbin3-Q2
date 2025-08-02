"use client";

import * as anchor from '@coral-xyz/anchor';

import { /* Keypair, */ PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { ellipsify } from '@/lib/utils'
import { ExplorerLink } from "../cluster/cluster-ui";
import {

  //useMarketplaceProgram,
  useMarketplaceProgramAccount
} from "./homeowner-data-access";
import { useWallet } from "@solana/wallet-adapter-react";

import { useEffect, useState } from "react";
import dayjs from 'dayjs';
import { SensorChangeButton } from './homeowner-sensor-change';

// Feed Account Data Component
function FeedAccountData() {
  const [feedData, setFeedData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const feedAddress = "9jfL52Gmudwee1RK8yuNguoZET7DMDqKSR6DePBJNXot";

  useEffect(() => {
    const fetchFeedData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch account info using RPC
        const response = await fetch('https://api.devnet.solana.com', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'getAccountInfo',
            params: [
              feedAddress,
              {
                encoding: 'base64',
              }
            ]
          })
        });

        const result = await response.json();
        
        if (result.error) {
          throw new Error(result.error.message);
        }

        if (result.result?.value) {
          const accountInfo = result.result.value;
          
          // Parse the base64 data to get Switchboard feed information
          let parsedData = null;
          if (accountInfo.data && accountInfo.data.length > 0) {
            try {
              // Convert base64 to buffer
              const buffer = Buffer.from(accountInfo.data[0], 'base64');
              
              console.log('Feed account data buffer:', {
                length: buffer.length,
                firstBytes: buffer.slice(0, 32).toString('hex'),
                base64Data: accountInfo.data[0].substring(0, 100) + '...'
              });
              
              // Basic parsing of Switchboard AggregatorAccountData structure
              // This is a simplified version - in production you'd use proper deserialization
              parsedData = {
                // The first 8 bytes are typically the account discriminator
                // Then we have various fields like name, queue_pubkey, etc.
                // For now, let's extract what we can safely
                dataLength: buffer.length,
                // Try to extract some basic info from the buffer
                hasData: buffer.length > 8,
                // Show first few bytes as hex for debugging
                firstBytes: buffer.length > 0 ? buffer.slice(0, Math.min(16, buffer.length)).toString('hex') : 'No data',
                // Show some additional bytes for analysis
                bytes32to48: buffer.length > 48 ? buffer.slice(32, 48).toString('hex') : 'N/A',
                bytes64to80: buffer.length > 80 ? buffer.slice(64, 80).toString('hex') : 'N/A',
                
                // Extract Switchboard-specific data
                // Account discriminator (first 8 bytes)
                discriminator: buffer.length > 8 ? buffer.slice(0, 8).toString('hex') : 'N/A',
                
                // Try to extract queue pubkey (usually around offset 32-64)
                queuePubkey: buffer.length > 64 ? buffer.slice(32, 64).toString('hex') : 'N/A',
                
                // Convert queue pubkey to readable format
                queuePubkeyReadable: buffer.length > 64 ? 
                  (() => {
                    try {
                      const pubkeyBytes = buffer.slice(32, 64);
                      // Convert to base58 format (simplified - in production you'd use proper base58 encoding)
                      const pubkeyHex = pubkeyBytes.toString('hex');
                      return `${pubkeyHex.substring(0, 8)}...${pubkeyHex.substring(pubkeyHex.length - 8)}`;
                    } catch (e) {
                      return 'Unknown';
                    }
                  })() : 'N/A',
                
                // Try to extract min_oracle_results (usually around offset 64-68)
                minOracleResults: buffer.length > 68 ? 
                  (() => {
                    try {
                      const bytes = buffer.slice(64, 68);
                      return bytes.readUInt32LE(0);
                    } catch (e) {
                      return 'Unknown';
                    }
                  })() : 'Unknown',
                
                // Try to extract min_job_results (usually around offset 68-72)
                minJobResults: buffer.length > 72 ? 
                  (() => {
                    try {
                      const bytes = buffer.slice(68, 72);
                      return bytes.readUInt32LE(0);
                    } catch (e) {
                      return 'Unknown';
                    }
                  })() : 'Unknown',
                
                // Try to extract min_update_delay_seconds (usually around offset 72-76)
                minUpdateDelaySeconds: buffer.length > 76 ? 
                  (() => {
                    try {
                      const bytes = buffer.slice(72, 76);
                      const value = bytes.readUInt32LE(0);
                      // Validate the value - if it's unreasonably high, it might be wrong
                      return value > 86400 * 365 ? 'Invalid/Unset' : value;
                    } catch (e) {
                      return 'Unknown';
                    }
                  })() : 'Unknown',
                
                // Convert update delay to readable format
                minUpdateDelayReadable: buffer.length > 76 ? 
                  (() => {
                    try {
                      const bytes = buffer.slice(72, 76);
                      const value = bytes.readUInt32LE(0);
                      
                      if (value > 86400 * 365) {
                        return 'Invalid/Unset';
                      } else if (value === 0) {
                        return 'No Delay (0 seconds)';
                      } else if (value < 60) {
                        return `${value} seconds`;
                      } else if (value < 3600) {
                        return `${Math.floor(value / 60)} minutes`;
                      } else if (value < 86400) {
                        return `${Math.floor(value / 3600)} hours`;
                      } else {
                        return `${Math.floor(value / 86400)} days`;
                      }
                    } catch (e) {
                      return 'Unknown';
                    }
                  })() : 'Unknown',
                
                // Try to extract latest round timestamp (usually around offset 200-208)
                latestRoundTimestamp: buffer.length > 208 ? 
                  (() => {
                    try {
                      const timestampBytes = buffer.slice(200, 208);
                      let timestamp = 0;
                      for (let i = 0; i < 8; i++) {
                        timestamp += timestampBytes[i] * Math.pow(256, i);
                      }
                      return new Date(timestamp * 1000).toISOString();
                    } catch (e) {
                      return 'Unknown';
                    }
                  })() : 'Unknown',
                
                // Convert timestamp to readable format
                latestRoundTimestampReadable: buffer.length > 208 ? 
                  (() => {
                    try {
                      const timestampBytes = buffer.slice(200, 208);
                      let timestamp = 0;
                      for (let i = 0; i < 8; i++) {
                        timestamp += timestampBytes[i] * Math.pow(256, i);
                      }
                      
                      if (timestamp === 0) {
                        return 'Never Updated (Epoch Start)';
                      } else {
                        const date = new Date(timestamp * 1000);
                        const now = new Date();
                        const diffMs = now.getTime() - date.getTime();
                        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                        const diffDays = Math.floor(diffHours / 24);
                        
                        if (diffDays > 0) {
                          return `${date.toLocaleString()} (${diffDays} days ago)`;
                        } else if (diffHours > 0) {
                          return `${date.toLocaleString()} (${diffHours} hours ago)`;
                        } else {
                          const diffMinutes = Math.floor(diffMs / (1000 * 60));
                          return `${date.toLocaleString()} (${diffMinutes} minutes ago)`;
                        }
                      }
                    } catch (e) {
                      return 'Unknown';
                    }
                  })() : 'Unknown',
                
                // Try to extract latest round result (usually around offset 208-216)
                latestRoundResult: buffer.length > 216 ? 
                  (() => {
                    try {
                      const resultBytes = buffer.slice(208, 216);
                      // This is a SwitchboardDecimal, which is 16 bytes but we'll read first 8
                      let result = 0;
                      for (let i = 0; i < 8; i++) {
                        result += resultBytes[i] * Math.pow(256, i);
                      }
                      return result.toString();
                    } catch (e) {
                      return 'Unknown';
                    }
                  })() : 'Unknown',
                
                // Convert latest round result to readable format
                latestRoundResultReadable: buffer.length > 216 ? 
                  (() => {
                    try {
                      const resultBytes = buffer.slice(208, 216);
                      let result = 0;
                      for (let i = 0; i < 8; i++) {
                        result += resultBytes[i] * Math.pow(256, i);
                      }
                      
                      // Try different interpretations
                      if (result === 0) {
                        return 'No Data (0)';
                      } else if (result < 1000000) {
                        return `${result} (raw value)`;
                      } else {
                        // Try as price data (divide by 10^8 for typical oracle precision)
                        const priceValue = result / Math.pow(10, 8);
                        return `${priceValue.toFixed(8)} (price interpretation)`;
                      }
                    } catch (e) {
                      return 'Unknown';
                    }
                  })() : 'Unknown',
                
                // Try to extract round status information
                roundStatus: buffer.length > 180 ? 
                  (() => {
                    try {
                      const statusBytes = buffer.slice(180, 184);
                      const numSuccess = statusBytes.readUInt32LE(0);
                      return numSuccess;
                    } catch (e) {
                      return 'Unknown';
                    }
                  })() : 'Unknown',
                
                // Feed status assessment
                feedStatus: 'Analyzing...',
                
                // Add raw data info for debugging
                rawDataLength: accountInfo.data[0].length,
                isBase64Valid: accountInfo.data[0].length > 0,
                rawBase64Data: accountInfo.data[0]
              };
            } catch (parseError) {
              console.error('Error parsing feed data:', parseError);
              parsedData = { 
                error: 'Failed to parse feed data',
                errorDetails: parseError instanceof Error ? parseError.message : 'Unknown error',
                rawDataLength: accountInfo.data[0].length
              };
            }
          } else {
            parsedData = { 
              error: 'No data in account',
              dataLength: 0,
              hasData: false
            };
          }

          setFeedData({
            address: feedAddress,
            owner: accountInfo.owner,
            lamports: accountInfo.lamports,
            dataSize: accountInfo.data?.length || 0,
            executable: accountInfo.executable,
            rentEpoch: accountInfo.rentEpoch,
            parsedData: parsedData
          });
        } else {
          setError('Feed account not found');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch feed data');
      } finally {
        setLoading(false);
      }
    };

    fetchFeedData();
  }, []);

  return (
    <div className="text-center space-y-4">
      <h3 className="text-lg font-semibold text-gray-700">Feed Account Data</h3>
      <div className="bg-gray-100 p-4 rounded-lg">
        {loading ? (
          <div className="text-sm text-gray-600">Loading feed data...</div>
        ) : error ? (
          <div className="text-sm text-red-600">Error: {error}</div>
        ) : feedData ? (
          <div className="space-y-2 text-sm">
            <div className="font-medium text-gray-700">
              <span className="font-semibold">Feed Address:</span>
              <span className="text-gray-500 ml-2">{ellipsify(feedData.address)}</span>
            </div>
            <div className="font-medium text-gray-700">
              <span className="font-semibold">Owner:</span>
              <span className="text-gray-500 ml-2">{ellipsify(feedData.owner)}</span>
            </div>
            <div className="font-medium text-gray-700">
              <span className="font-semibold">Balance:</span>
              <span className="text-gray-500 ml-2">{(feedData.lamports / 1000000000).toFixed(9)} SOL</span>
            </div>
            <div className="font-medium text-gray-700">
              <span className="font-semibold">Data Size:</span>
              <span className="text-gray-500 ml-2">{feedData.dataSize} bytes</span>
            </div>
            <div className="font-medium text-gray-700">
              <span className="font-semibold">Executable:</span>
              <span className="text-gray-500 ml-2">{feedData.executable ? 'Yes' : 'No'}</span>
            </div>
            <div className="font-medium text-gray-700">
              <span className="font-semibold">Rent Epoch:</span>
              <span className="text-gray-500 ml-2">{feedData.rentEpoch}</span>
            </div>
            
            {/* Parsed Feed Data */}
            {feedData.parsedData && (
              <div className="mt-4 pt-4 border-t border-gray-300">
                <div className="font-semibold text-gray-700 mb-2">Parsed Feed Data:</div>
                <div className="space-y-1 text-xs">
                  <div className="font-medium text-gray-700">
                    <span className="font-semibold">Data Length:</span>
                    <span className="text-gray-500 ml-2">{feedData.parsedData.dataLength || 0} bytes</span>
                  </div>
                  <div className="font-medium text-gray-700">
                    <span className="font-semibold">Has Data:</span>
                    <span className="text-gray-500 ml-2">{feedData.parsedData.hasData ? 'Yes' : 'No'}</span>
                  </div>
                  {feedData.parsedData.rawDataLength !== undefined && (
                    <div className="font-medium text-gray-700">
                      <span className="font-semibold">Raw Base64 Length:</span>
                      <span className="text-gray-500 ml-2">{feedData.parsedData.rawDataLength} chars</span>
                    </div>
                  )}
                  <div className="font-medium text-gray-700">
                    <span className="font-semibold">Account Discriminator:</span>
                    <span className="text-gray-500 ml-2 font-mono">{feedData.parsedData.discriminator}</span>
                  </div>
                  <div className="font-medium text-gray-700">
                    <span className="font-semibold">Queue Pubkey:</span>
                    <span className="text-gray-500 ml-2 font-mono">{feedData.parsedData.queuePubkeyReadable}</span>
                  </div>
                  <div className="font-medium text-gray-700">
                    <span className="font-semibold">Min Oracle Results:</span>
                    <span className="text-gray-500 ml-2">{feedData.parsedData.minOracleResults} oracles</span>
                  </div>
                  <div className="font-medium text-gray-700">
                    <span className="font-semibold">Min Job Results:</span>
                    <span className="text-gray-500 ml-2">{feedData.parsedData.minJobResults} jobs</span>
                  </div>
                  <div className="font-medium text-gray-700">
                    <span className="font-semibold">Min Update Delay:</span>
                    <span className="text-gray-500 ml-2">{feedData.parsedData.minUpdateDelayReadable}</span>
                  </div>
                  <div className="font-medium text-gray-700">
                    <span className="font-semibold">Latest Update:</span>
                    <span className="text-gray-500 ml-2">{feedData.parsedData.latestRoundTimestampReadable}</span>
                  </div>
                  <div className="font-medium text-gray-700">
                    <span className="font-semibold">Latest Value:</span>
                    <span className="text-gray-500 ml-2">{feedData.parsedData.latestRoundResultReadable}</span>
                  </div>
                  <div className="font-medium text-gray-700">
                    <span className="font-semibold">Round Status (Success Count):</span>
                    <span className="text-gray-500 ml-2">{feedData.parsedData.roundStatus}</span>
                  </div>
                  <div className="font-medium text-gray-700">
                    <span className="font-semibold">Feed Status:</span>
                    <span className="text-gray-500 ml-2">{feedData.parsedData.feedStatus}</span>
                  </div>
                  
                                               {/* Raw hex data for debugging */}
                             <div className="mt-4 pt-4 border-t border-gray-300">
                               <div className="font-semibold text-gray-700 mb-2">Raw Hex Data Analysis:</div>
                               <div className="space-y-2 text-xs">
                                 {/* First 16 bytes - Account discriminator */}
                                 <div className="bg-gray-50 p-2 rounded">
                                   <div className="font-semibold text-gray-700 mb-1">Account Discriminator (First 16 bytes):</div>
                                   <div className="font-medium text-gray-700">
                                     <span className="font-semibold">Hex:</span>
                                     <span className="text-gray-500 ml-2 font-mono">{feedData.parsedData.firstBytes}</span>
                                   </div>
                                   <div className="font-medium text-gray-700">
                                     <span className="font-semibold">ASCII:</span>
                                     <span className="text-gray-500 ml-2 font-mono">
                                       {(() => {
                                         try {
                                           const bytes = Buffer.from(feedData.parsedData.firstBytes, 'hex');
                                           return bytes.toString('ascii').replace(/[^\x20-\x7E]/g, '.');
                                         } catch (e) {
                                           return 'Invalid ASCII';
                                         }
                                       })()}
                                     </span>
                                   </div>
                                   <div className="font-medium text-gray-700">
                                     <span className="font-semibold">Decimal:</span>
                                     <span className="text-gray-500 ml-2">
                                       {(() => {
                                         try {
                                           const bytes = Buffer.from(feedData.parsedData.firstBytes, 'hex');
                                           return Array.from(bytes).map(b => b.toString()).join(', ');
                                         } catch (e) {
                                           return 'Invalid';
                                         }
                                       })()}
                                     </span>
                                   </div>
                                 </div>

                                 {/* Queue pubkey section */}
                                 <div className="bg-gray-50 p-2 rounded">
                                   <div className="font-semibold text-gray-700 mb-1">Queue Configuration (Bytes 32-48):</div>
                                   <div className="font-medium text-gray-700">
                                     <span className="font-semibold">Hex:</span>
                                     <span className="text-gray-500 ml-2 font-mono">{feedData.parsedData.bytes32to48}</span>
                                   </div>
                                   <div className="font-medium text-gray-700">
                                     <span className="font-semibold">As Public Key:</span>
                                     <span className="text-gray-500 ml-2 font-mono">
                                       {(() => {
                                         try {
                                           const pubkeyHex = feedData.parsedData.bytes32to48;
                                           return `${pubkeyHex.substring(0, 8)}...${pubkeyHex.substring(pubkeyHex.length - 8)}`;
                                         } catch (e) {
                                           return 'Invalid';
                                         }
                                       })()}
                                     </span>
                                   </div>
                                   <div className="font-medium text-gray-700">
                                     <span className="font-semibold">Decimal Values:</span>
                                     <span className="text-gray-500 ml-2">
                                       {(() => {
                                         try {
                                           const bytes = Buffer.from(feedData.parsedData.bytes32to48, 'hex');
                                           return Array.from(bytes).map(b => b.toString()).join(', ');
                                         } catch (e) {
                                           return 'Invalid';
                                         }
                                       })()}
                                     </span>
                                   </div>
                                 </div>

                                 {/* Configuration section */}
                                 <div className="bg-gray-50 p-2 rounded">
                                   <div className="font-semibold text-gray-700 mb-1">Configuration Values (Bytes 64-80):</div>
                                   <div className="font-medium text-gray-700">
                                     <span className="font-semibold">Hex:</span>
                                     <span className="text-gray-500 ml-2 font-mono">{feedData.parsedData.bytes64to80}</span>
                                   </div>
                                   <div className="font-medium text-gray-700">
                                     <span className="font-semibold">As 32-bit Values:</span>
                                     <span className="text-gray-500 ml-2">
                                       {(() => {
                                         try {
                                           const bytes = Buffer.from(feedData.parsedData.bytes64to80, 'hex');
                                           if (bytes.length >= 16) {
                                             const val1 = bytes.readUInt32LE(0);
                                             const val2 = bytes.readUInt32LE(4);
                                             const val3 = bytes.readUInt32LE(8);
                                             const val4 = bytes.readUInt32LE(12);
                                             return `${val1}, ${val2}, ${val3}, ${val4}`;
                                           }
                                           return 'Insufficient data';
                                         } catch (e) {
                                           return 'Invalid';
                                         }
                                       })()}
                                     </span>
                                   </div>
                                   <div className="font-medium text-gray-700">
                                     <span className="font-semibold">As ASCII:</span>
                                     <span className="text-gray-500 ml-2 font-mono">
                                       {(() => {
                                         try {
                                           const bytes = Buffer.from(feedData.parsedData.bytes64to80, 'hex');
                                           return bytes.toString('ascii').replace(/[^\x20-\x7E]/g, '.');
                                         } catch (e) {
                                           return 'Invalid ASCII';
                                         }
                                       })()}
                                     </span>
                                   </div>
                                 </div>

                                 {/* Additional data sections */}
                                 <div className="bg-gray-50 p-2 rounded">
                                   <div className="font-semibold text-gray-700 mb-1">Additional Data Slices:</div>
                                   <div className="space-y-1">
                                     {(() => {
                                       try {
                                         const buffer = Buffer.from(feedData.parsedData.rawBase64Data || '', 'base64');
                                         const sections = [
                                           { name: 'Bytes 80-96', start: 80, end: 96 },
                                           { name: 'Bytes 96-112', start: 96, end: 112 },
                                           { name: 'Bytes 112-128', start: 112, end: 128 },
                                           { name: 'Bytes 128-144', start: 128, end: 144 },
                                           { name: 'Bytes 144-160', start: 144, end: 160 },
                                           { name: 'Bytes 160-176', start: 160, end: 176 },
                                           { name: 'Bytes 176-192', start: 176, end: 192 },
                                           { name: 'Bytes 192-208', start: 192, end: 208 },
                                         ];
                                         
                                         return sections.map((section, index) => {
                                           if (buffer.length >= section.end) {
                                             const hexData = buffer.slice(section.start, section.end).toString('hex');
                                             const asciiData = buffer.slice(section.start, section.end).toString('ascii').replace(/[^\x20-\x7E]/g, '.');
                                             return (
                                               <div key={index} className="border-l-2 border-gray-300 pl-2">
                                                 <div className="font-medium text-gray-700">
                                                   <span className="font-semibold">{section.name}:</span>
                                                   <span className="text-gray-500 ml-2 font-mono">{hexData}</span>
                                                 </div>
                                                 <div className="font-medium text-gray-700">
                                                   <span className="font-semibold">ASCII:</span>
                                                   <span className="text-gray-500 ml-2 font-mono">{asciiData}</span>
                                                 </div>
                                               </div>
                                             );
                                           }
                                           return null;
                                         });
                                       } catch (e) {
                                         return <div className="text-red-500">Error parsing additional data</div>;
                                       }
                                     })()}
                                   </div>
                                 </div>
                               </div>
                             </div>
                  {feedData.parsedData.error && (
                    <div className="font-medium text-red-600">
                      <span className="font-semibold">Parse Error:</span>
                      <span className="ml-2">{feedData.parsedData.error}</span>
                    </div>
                  )}
                  {feedData.parsedData.errorDetails && (
                    <div className="font-medium text-red-500 text-xs">
                      <span className="font-semibold">Error Details:</span>
                      <span className="ml-2">{feedData.parsedData.errorDetails}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-sm text-gray-600">No feed data available</div>
        )}
      </div>
    </div>
  );
}


//Manage Listing
//shows current listing and update/delete button
export function ListingCard({ account }: { account: PublicKey }) {
  const { accountQuery, updateListing, deleteListing } = useMarketplaceProgramAccount({
    account,
  });
  const { publicKey } = useWallet();
  const [message, setMessage] = useState("");

  // State variables for listing fields
  const [address, setAddress] = useState("");
  //use current value
  //const [address, setAddress] = useState(accountQuery.data?.address  );

  const [rentalRate, setRentalRate] = useState(0);
  const [sensorId, setSensorId] = useState("");
  const [latitude, setLatitude] = useState(0);
  const [longitude, setLongitude] = useState(0);
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [availabilityStart, setAvailabilityStart] = useState('');
  const [availabilityEnd, setAvailabilityEnd] = useState('');
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // Update state when accountQuery.data changes
  useEffect(() => {
    if (accountQuery.data) {
      setAddress(accountQuery.data.address);
      setRentalRate(accountQuery.data.rentalRate / LAMPORTS_PER_SOL);
      setSensorId(accountQuery.data.sensorId);
      setLatitude(accountQuery.data.latitude);
      setLongitude(accountQuery.data.longitude);
      setAdditionalInfo(accountQuery.data.additionalInfo || "");
      setAvailabilityStart(dayjs.unix(Number(accountQuery.data.availabiltyStart)).format('YYYY-MM-DDTHH:mm'));
      setAvailabilityEnd(dayjs.unix(Number(accountQuery.data.availabiltyEnd)).format('YYYY-MM-DDTHH:mm'));
      setEmail(accountQuery.data.email);
      setPhone(accountQuery.data.phone);
    }
  }, [accountQuery.data]);

  // Load data from accountQuery
  const title = accountQuery.data?.address;

  // Form validation
  const isFormValid = message.trim() !== "";

  const handleSubmit = () => {
    if (publicKey) {
      updateListing.mutateAsync({
        address,
        rentalRate,
        sensorId,
        latitude,
        longitude,
        additionalInfo,
        availabilityStart: new anchor.BN(Math.floor(new Date(availabilityStart).getTime() / 1000)),
        availabilityEnd: new anchor.BN(Math.floor(new Date(availabilityEnd).getTime() / 1000)),
        email,
        phone,
        homeowner1: publicKey
      });
    }
  };

  if (!publicKey) {
    return <p>Connect your wallet</p>;
  }

  // Before rendering the card content, check if accountQuery is loading or has no data
  if (accountQuery.isLoading) {
    return <div className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow-lg text-gray-700 text-center">Loading card...</div>;
  }
  if (!accountQuery.data) {
    return <div className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow-lg text-gray-700 text-center">Unable to load card data. Please try refreshing the page.</div>;
  }

  return (
    <div className="card card-bordered border-base-300 border-4 text-neutral-content bg-blue-500">
      <div className="card-body items-center text-center bg-blue-200">
        <div className="space-y-6">
          <h2 className="card-title justify-center text-3xl cursor-pointer text-black" onClick={() => accountQuery.refetch()}>
            Manage Listing
            <p className="text-base ">(Update or Delete)</p> 
            </h2>
          <div className="space-y-4">
            <label htmlFor="address" className="block text-sm font-medium text-black">
              Home Address: <span className="text-black-300">{/* {accountQuery.data?.address} */}</span>
            </label>
            <input
              type="text"
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="input input-bordered w-full max-w-xs border border-black text-black"
              placeholder="Home Address"
            />

            <label htmlFor="rentalRate" className="block text-sm font-medium text-black">
              Rental Rate: <span className="text-black-300">{/* {accountQuery.data?.rentalRate} */}</span>
            </label>
            <input
              type="number"
              id="rentalRate"
              value={rentalRate}
              onChange={(e) => setRentalRate(Number(e.target.value))}
              className="input input-bordered w-full max-w-xs border border-black text-black"
              placeholder="Rental Rate"
            />

            <label htmlFor="sensorId" className="block text-sm font-medium text-black">
              Sensor ID: <span className="text-black-300">{/* {accountQuery.data?.sensorId} */}</span>
            </label>
            <input
              type="text"
              id="sensorId"
              value={sensorId}
              onChange={(e) => setSensorId(e.target.value)}
              className="input input-bordered w-full max-w-xs border border-black text-black"
              placeholder="Sensor ID"
            />

            <label htmlFor="latitude" className="block text-sm font-medium text-black">
              Latitude: <span className="text-black-300">{/* {accountQuery.data?.latitude} */}</span>
            </label>
            <input
              type="number"
              id="latitude"
              value={latitude}
              onChange={(e) => setLatitude(Number(e.target.value))}
              className="input input-bordered w-full max-w-xs border border-black text-black"
              placeholder="Latitude"
            />

            <label htmlFor="longitude" className="block text-sm font-medium text-black">
              Longitude: <span className="text-black-300">{/* {accountQuery.data?.longitude} */}</span>
            </label>
            <input
              type="number"
              id="longitude"
              value={longitude}
              onChange={(e) => setLongitude(Number(e.target.value))}
              className="input input-bordered w-full max-w-xs border border-black text-black"
              placeholder="Longitude"
            />

            <label htmlFor="additionalInfo" className="block text-sm font-medium text-black">
              Additional Info: <span className="text-black-300">{/* {accountQuery.data?.additionalInfo} */}</span>
            </label>
            <textarea
              id="additionalInfo"
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              className="textarea textarea-bordered w-full max-w-xs border border-black text-black"
              placeholder="Additional Info"
            />

            {/* Availability Start/End */}
            <div className="mb-4 flex flex-col items-center">
              <label className="block text-sm font-medium text-gray-700 mb-1 text-center w-full max-w-xs">
                Availability Start
              </label>
              <input
                type="datetime-local"
                id="availabilityStart"
                placeholder="Availability Start"
                value={availabilityStart}
                onChange={e => setAvailabilityStart(e.target.value)}
                className="input input-bordered w-full max-w-xs border border-black text-black mx-auto"
              />
              <label className="block text-sm font-medium text-gray-700 mb-1 text-center w-full max-w-xs mt-2">
                Availability End
              </label>
              <input
                type="datetime-local"
                id="availabilityEnd"
                placeholder="Availability End"
                value={availabilityEnd}
                onChange={e => setAvailabilityEnd(e.target.value)}
                className="input input-bordered w-full max-w-xs border border-black text-black mx-auto"
              />
            </div>

            <label htmlFor="email" className="block text-sm font-medium text-black">
              Email: <span className="text-black-300">{/* {accountQuery.data?.email} */}</span>
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input input-bordered w-full max-w-xs border border-black text-black"
              placeholder="Email"
            />

            <label htmlFor="phone" className="block text-sm font-medium text-black">
              Phone: <span className="text-black-300">{/* {accountQuery.data?.phone} */}</span>
            </label>
            <input
              type="tel"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="input input-bordered w-full max-w-xs border border-black text-black"
              placeholder="Phone"
            />
          </div>



          <div className="card-actions justify-around">

            <button
              className="bg-blue-500 text-white border-2 border-blue-700 hover:bg-blue-600 hover:border-blue-800 transition-all duration-300 ease-in-out px-6 py-3 rounded-lg shadow-lg"
              onClick={handleSubmit}
              disabled={updateListing.isPending}
            >
              Update Listing {updateListing.isPending && "..."}
            </button>
          </div>

          {/* Feed Account Data */}
          <FeedAccountData />

          {/* Admin Add Feed Button */}
          <div className="text-center space-y-4">
            <h3 className="text-lg font-semibold text-gray-700">Admin Functions</h3>
            <button
              className="bg-green-500 text-white border-2 border-green-700 hover:bg-green-600 hover:border-green-800 transition-all duration-300 ease-in-out px-6 py-3 rounded-lg shadow-lg"
              onClick={() => {
                // TODO: Implement admin add feed functionality
                console.log('Admin add feed clicked');
                alert('Admin add feed functionality - to be implemented');
              }}
            >
              Admin Add Feed
            </button>
          </div>

          {/* Sensor Change Button for Homeowners */}
          <div className="text-center space-y-4">
            <h3 className="text-lg font-semibold text-gray-700">Simulate Sensor Change</h3>
            <SensorChangeButton 
              account={account} 
              maker={accountQuery.data?.maker || new PublicKey('11111111111111111111111111111111')}
              feed={new PublicKey("9jfL52Gmudwee1RK8yuNguoZET7DMDqKSR6DePBJNXot")}
            />
          </div>

          <div className="text-center space-y-4">
            <p>
              <ExplorerLink
                path={`account/${account}`}
                label={ellipsify(account.toString())}
              />
            </p>
            <button
              className="bg-red-500 border border-red-700 rounded-md px-4 py-2 text-black hover:bg-red-600 transition"
              onClick={() => {
                if (
                  !window.confirm(
                    "Are you sure you want to close this account?"
                  )
                ) {
                  return;
                }
                const title = accountQuery.data?.address;
                if (title) {
                  return deleteListing.mutateAsync({ homeowner1: publicKey });
                }
              }}
              disabled={deleteListing.isPending}
            >
              Delete Listing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

