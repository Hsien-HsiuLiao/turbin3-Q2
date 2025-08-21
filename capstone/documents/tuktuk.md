# Tuktuk Integration Guide for Panorama Parking Project

## What is Tuktuk?

**Tuktuk is NOT a general Solana development tool** - it's a **permissionless crank service** for Solana. If you have a Solana smart contract endpoint that needs to be run on a trigger or specific time, you can use Tuktuk to run it automatically.

## Why Use Tuktuk for Panorama Parking?

- **Automated Parking Operations**: Run parking-related tasks automatically
- **Scheduled Maintenance**: Execute periodic tasks like sensor data processing
- **Payment Processing**: Automate payment confirmations and settlements
- **Sensor Integration**: Process IoT parking sensor data on schedule
- **Marketplace Management**: Automate listing updates and maintenance tasks

## Architecture Overview

Tuktuk's architecture allows for "crankers" to run a simple Rust utility that requires only:
- A working Solana RPC URL
- Minimal dependencies
- No dependency on Geyser, Yellowstone, or other indexing services

## Installation & Setup

### Prerequisites
- Rust and Cargo installed
- Solana CLI tools
- OpenSSL (for macOS: `brew install openssl`)
- Rust version 1.85: `rustup install 1.85 && rustup default 1.85`

### Install Tuktuk CLI
```bash
cargo install tuktuk-cli
```

### Install Crank Turner (Optional - for running tasks)
```bash
cargo install tuktuk-crank-turner
```

## Core Concepts

### Task Queue
- **Purpose**: A queue that holds tasks to be executed
- **Funding**: Requires minimum 1 SOL deposit + funding amount for recursive tasks
- **Capacity**: Configurable maximum number of tasks
- **Reusability**: Designed to be reused for multiple use cases

### Crank Turner
- **Purpose**: Executes queued tasks
- **Incentive**: Paid in SOL for each completed task
- **Requirements**: Good Solana RPC without heavy rate limits

### Cron Jobs
- **Purpose**: Schedule tasks to run at specific times
- **Funding**: Must be kept funded to continue queuing tasks
- **Flexibility**: Can queue multiple tasks per execution

## Integration with Panorama Parking

### 1. Create a Task Queue
```bash
tuktuk -u <your-solana-url> task-queue create \
  --name "panorama-parking-queue" \
  --capacity 50 \
  --funding-amount 100000000 \
  --queue-authority <your-wallet-address> \
  --crank-reward 1000000
```

### 2. Use Cases for Parking Operations

#### Automated Sensor Data Processing
```typescript
// Queue a task to process parking sensor data
await program.methods.queueTaskV0({
  id: "sensor-process-" + Date.now(),
  trigger: { now: {} },
  transaction: {
    compileV0: {
      programId: sensorProgram.programId,
      instructions: [
        // Instructions to process sensor data
        // Update parking availability
        // Trigger notifications
      ],
    },
  },
});
```

#### Scheduled Maintenance Tasks
```typescript
// Create a cron job for hourly maintenance
const cronJob = await createCronJob(cronProgram, {
  tuktukProgram: program,
  taskQueue,
  args: {
    name: "parking-maintenance",
    schedule: "0 0 * * * *", // Every hour
    freeTasksPerTransaction: 0,
    numTasksPerQueueCall: 1,
  }
});
```

#### Payment Processing Automation
```typescript
// Queue payment confirmation tasks
await program.methods.queueTaskV0({
  id: "payment-confirm-" + paymentId,
  trigger: { now: {} },
  transaction: {
    compileV0: {
      programId: paymentProgram.programId,
      instructions: [
        // Instructions to confirm payment
        // Update parking reservation
        // Send confirmation
      ],
    },
  },
});
```

### 3. Task Queue Management

#### Add Queue Authorities
```bash
# Allow your marketplace program to queue tasks
tuktuk -u <your-solana-url> task-queue add-queue-authority \
  --task-queue-name "panorama-parking-queue" \
  --queue-authority <marketplace-program-pda>
```

#### Monitor Tasks
```bash
# List all tasks in your queue
tuktuk -u <your-solana-url> task list \
  --task-queue-name "panorama-parking-queue"

# Filter tasks by description
tuktuk -u <your-solana-url> task list \
  --task-queue-name "panorama-parking-queue" \
  --description "sensor-process"
```

#### Fund Task Queue
```bash
# Add funding for recursive tasks
tuktuk -u <your-solana-url> task-queue fund \
  --task-queue-name "panorama-parking-queue" \
  --amount 50000000
```

## Implementation Examples

### 1. Basic Task Queuing
```typescript
import { init } from "@helium/tuktuk-sdk";

const program = await init(provider);
const taskQueue = await initializeTaskQueue(program, "panorama-parking-queue");

// Queue a simple task
await program.methods.queueTaskV0({
  id: "update-availability",
  trigger: { now: {} },
  transaction: {
    compileV0: {
      programId: marketplaceProgram.programId,
      instructions: [
        // Your parking marketplace instructions
      ],
    },
  },
});
```

### 2. Cron Job for Regular Updates
```typescript
import { createCronJob, init as initCron } from "@helium/cron-sdk";

const cronProgram = await initCron(provider);

// Create hourly parking availability update
const { pubkeys: { cronJob } } = await createCronJob(cronProgram, {
  tuktukProgram: program,
  taskQueue,
  args: {
    name: "parking-availability-update",
    schedule: "0 0 * * * *", // Every hour
    freeTasksPerTransaction: 0,
    numTasksPerQueueCall: 1,
  }
});
```

### 3. Remote Transaction Server
For complex transactions that can't be compiled ahead of time:

```typescript
// Queue a remote transaction
await program.methods.queueTaskV0({
  id: "complex-parking-operation",
  trigger: { now: {} },
  transaction: {
    remoteV0: {
      url: "https://your-server.com/parking-tasks",
      signer: yourWallet,
    },
  },
});
```

Your server should handle POST requests and return:
```json
{
  "transaction": "<base64-encoded-transaction>",
  "remaining_accounts": "<base64-encoded-remaining-accounts>",
  "signature": "<base64-encoded-signature>"
}
```

## Configuration Files

### Crank Turner Config
```toml
# config.toml
rpc_url = "https://api.mainnet-beta.solana.com"
key_path = "/path/to/your/keypair.json"
min_crank_fee = 10000
```

### Environment Variables
```bash
export TUKTUK__RPC_URL="https://api.mainnet-beta.solana.com"
export TUKTUK__KEY_PATH="/path/to/your/keypair.json"
export TUKTUK__MIN_CRANK_FEE=10000
```

## Best Practices for Panorama Parking

### 1. Task Queue Design
- **Reuse Queues**: Don't create new queues for each user
- **Proper Funding**: Ensure sufficient funding for recursive tasks
- **Capacity Planning**: Set appropriate capacity based on expected task volume

### 2. Task Design
- **Idempotent Operations**: Tasks should be safe to run multiple times
- **Error Handling**: Implement proper error handling in your tasks
- **Resource Management**: Be mindful of Solana transaction limits

### 3. Monitoring
- **Regular Checks**: Monitor task execution and cron job status
- **Funding Alerts**: Set up alerts for low funding levels
- **Performance Metrics**: Track task success rates and execution times

## Troubleshooting

### Common Issues

#### Task Not Running
```bash
# Check task status
tuktuk -u <your-solana-url> task list \
  --task-queue-name "panorama-parking-queue"

# Run task manually if needed
tuktuk -u <your-solana-url> task run \
  --task-queue-name "panorama-parking-queue" \
  --task-id <task-id>
```

#### Cron Job Issues
```bash
# Check cron job status
tuktuk -u <your-solana-url> cron get \
  --cron-name "parking-maintenance"

# Requeue if removed from queue
tuktuk -u <your-solana-url> cron requeue \
  --cron-name "parking-maintenance"
```

#### Insufficient Funding
```bash
# Fund task queue
tuktuk -u <your-solana-url> task-queue fund \
  --task-queue-name "panorama-parking-queue" \
  --amount 100000000
```

## Resources

- **Your Tuktuk Implementation**: `./tuktuk/` folder
- **TypeScript Examples**: `./tuktuk/typescript-examples/`
- **Solana Programs**: `./tuktuk/solana-programs/`
- **SDK**: `./tuktuk/tuktuk-sdk/`
- **Official GitHub Repository**: [Tuktuk GitHub Repo](https://github.com/helium/tuktuk)

## Next Steps

1. **Install Tuktuk CLI** in your development environment
2. **Create a Task Queue** for panorama-parking operations
3. **Implement Basic Tasks** for parking operations
4. **Set Up Cron Jobs** for scheduled maintenance
5. **Test Integration** with your existing marketplace
6. **Monitor and Optimize** task execution

## Integration Checklist

- [ ] Install Tuktuk CLI and dependencies
- [ ] Create panorama-parking task queue
- [ ] Configure queue authorities
- [ ] Implement basic parking tasks
- [ ] Set up cron jobs for maintenance
- [ ] Test task execution
- [ ] Monitor performance and funding
- [ ] Deploy to production networks

This guide is based on your actual Tuktuk implementation and provides specific guidance for integrating it with your panorama-parking marketplace project. 