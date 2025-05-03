import { OracleJob } from "@switchboard-xyz/common"

const jobs: OracleJob[] = [
  new OracleJob({
    tasks: [
      {
        httpTask: {
          url: "https://lorawan-api.vercel.app/api/driver-parked",
        }
      },
      {
        jsonParseTask: {
          path: "$[0].distance_in_cm"
        }
      }
    ],
  }),
];
console.log("Running simulation...\n");

// Print the jobs that are being run.
const jobJson = JSON.stringify({ jobs: jobs.map((job) => job.toJSON()) });
console.log(jobJson);
console.log();

// Serialize the jobs to base64 strings.
const serializedJobs = jobs.map((oracleJob) => {
  const encoded = OracleJob.encodeDelimited(oracleJob).finish();
  const base64 = Buffer.from(encoded).toString("base64");
  return base64;
});

// Call the simulation server.
const response = await fetch("https://api.switchboard.xyz/api/simulate", {
  method: "POST",
  headers: [["Content-Type", "application/json"]],
  body: JSON.stringify({ cluster: "Mainnet", jobs: serializedJobs }),
});

/* // Log the response from the simulation server
const responseData = await response.json();
console.log(`Response from simulation server:`, responseData); */

// Check response.
if (response.ok) {
  const data = await response.json();
  console.log(`Response is good (${response.status})`);
  console.log(JSON.stringify(data, null, 2));
} else {
  console.log(`Response is bad (${response.status})`);
  console.log(await response.text());
}