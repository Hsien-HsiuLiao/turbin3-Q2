https://www.anchor-lang.com/docs/quickstart/local#deploy-to-devnet

anchor deploy
Deploying cluster: https://api.devnet.solana.com
Upgrade authority: ./HTurbin3-wallet.json
Deploying program "marketplace"...
Program path: /home/h/Projects/turbin3-Q2/panorama-parking-marketplace/target/deploy/marketplace.so...
Program Id: FXUQwDsKJNrYFsfiUokPbH4BSrZtoC9m8HpoiMvYxtSE

Signature: 2UyEqFG8nWjMgBrq9Rbz2gCxc9g97tLxAmr47YSfZ7xT6G4JYwAGx84U3PAtKkPMy5YNvmgyozX2Vvti1kHGc9b8

Deploy success

anchor idl init --filepath target/idl/marketplace.json FXUQwDsKJNrYFsfiUokPbH4BSrZtoC9m8HpoiMvYxtSE
Idl data length: 1332 bytes
Step 0/1332 
Step 600/1332 
Step 1200/1332 
Error: error sending request for url (https://api.devnet.solana.com/): operation timed out

Caused by:
    0: error sending request for url (https://api.devnet.solana.com/): operation timed out
    1: operation timed out
[h@manjaro24 panorama-parking-marketplace]$ anchor idl init --filepath target/idl/marketplace.json FXUQwDsKJNrYFsfiUokPbH4BSrZtoC9m8HpoiMvYxtSE
Error creating IDL account: RPC response error -32002: Transaction simulation failed: Error processing Instruction 0: custom program error: 0x0; 7 log messages:
  Program FXUQwDsKJNrYFsfiUokPbH4BSrZtoC9m8HpoiMvYxtSE invoke [1]
  Program log: Instruction: IdlCreateAccount
  Program 11111111111111111111111111111111 invoke [2]
  Create Account: account Address { address: 81xa3F77MeurQs2pMEtv2MnusHMgpVn3h5R3DvoHZr4L, base: Some(93SnPws8ZemTMC5hCk6KpoEZ4R5zGK9izi7oVuyLJba6) } already in use
  Program 11111111111111111111111111111111 failed: custom program error: 0x0
  Program FXUQwDsKJNrYFsfiUokPbH4BSrZtoC9m8HpoiMvYxtSE consumed 9036 of 200000 compute units
  Program FXUQwDsKJNrYFsfiUokPbH4BSrZtoC9m8HpoiMvYxtSE failed: custom program error: 0x0
. Retrying...
Error creating IDL account: RPC response error -32002: Transaction simulation failed: Error processing Instruction 0: custom program error: 0x0; 7 log messages:
  Program FXUQwDsKJNrYFsfiUokPbH4BSrZtoC9m8HpoiMvYxtSE invoke [1]
  Program log: Instruction: IdlCreateAccount
  Program 11111111111111111111111111111111 invoke [2]
  Create Account: account Address { address: 81xa3F77MeurQs2pMEtv2MnusHMgpVn3h5R3DvoHZr4L, base: Some(93SnPws8ZemTMC5hCk6KpoEZ4R5zGK9izi7oVuyLJba6) } already in use
  Program 11111111111111111111111111111111 failed: custom program error: 0x0
  Program FXUQwDsKJNrYFsfiUokPbH4BSrZtoC9m8HpoiMvYxtSE consumed 9036 of 200000 compute units
  Program FXUQwDsKJNrYFsfiUokPbH4BSrZtoC9m8HpoiMvYxtSE failed: custom program error: 0x0
. Retrying...
Error creating IDL account: RPC response error -32002: Transaction simulation failed: Error processing Instruction 0: custom program error: 0x0; 7 log messages:
  Program FXUQwDsKJNrYFsfiUokPbH4BSrZtoC9m8HpoiMvYxtSE invoke [1]
  Program log: Instruction: IdlCreateAccount
  Program 11111111111111111111111111111111 invoke [2]
  Create Account: account Address { address: 81xa3F77MeurQs2pMEtv2MnusHMgpVn3h5R3DvoHZr4L, base: Some(93SnPws8ZemTMC5hCk6KpoEZ4R5zGK9izi7oVuyLJba6) } already in use
  Program 11111111111111111111111111111111 failed: custom program error: 0x0
  Program FXUQwDsKJNrYFsfiUokPbH4BSrZtoC9m8HpoiMvYxtSE consumed 9036 of 200000 compute units
  Program FXUQwDsKJNrYFsfiUokPbH4BSrZtoC9m8HpoiMvYxtSE failed: custom program error: 0x0
. Retrying...
Error creating IDL account: RPC response error -32002: Transaction simulation failed: Error processing Instruction 0: custom program error: 0x0; 7 log messages:
  Program FXUQwDsKJNrYFsfiUokPbH4BSrZtoC9m8HpoiMvYxtSE invoke [1]
  Program log: Instruction: IdlCreateAccount
  Program 11111111111111111111111111111111 invoke [2]
  Create Account: account Address { address: 81xa3F77MeurQs2pMEtv2MnusHMgpVn3h5R3DvoHZr4L, base: Some(93SnPws8ZemTMC5hCk6KpoEZ4R5zGK9izi7oVuyLJba6) } already in use
  Program 11111111111111111111111111111111 failed: custom program error: 0x0
  Program FXUQwDsKJNrYFsfiUokPbH4BSrZtoC9m8HpoiMvYxtSE consumed 9036 of 200000 compute units
  Program FXUQwDsKJNrYFsfiUokPbH4BSrZtoC9m8HpoiMvYxtSE failed: custom program error: 0x0
. Retrying...
Error creating IDL account: RPC response error -32002: Transaction simulation failed: Error processing Instruction 0: custom program error: 0x0; 7 log messages:
  Program FXUQwDsKJNrYFsfiUokPbH4BSrZtoC9m8HpoiMvYxtSE invoke [1]
  Program log: Instruction: IdlCreateAccount
  Program 11111111111111111111111111111111 invoke [2]
  Create Account: account Address { address: 81xa3F77MeurQs2pMEtv2MnusHMgpVn3h5R3DvoHZr4L, base: Some(93SnPws8ZemTMC5hCk6KpoEZ4R5zGK9izi7oVuyLJba6) } already in use
  Program 11111111111111111111111111111111 failed: custom program error: 0x0
  Program FXUQwDsKJNrYFsfiUokPbH4BSrZtoC9m8HpoiMvYxtSE consumed 9036 of 200000 compute units
  Program FXUQwDsKJNrYFsfiUokPbH4BSrZtoC9m8HpoiMvYxtSE failed: custom program error: 0x0
. Retrying...
Error creating IDL account: RPC response error -32002: Transaction simulation failed: Error processing Instruction 0: custom program error: 0x0; 7 log messages:
  Program FXUQwDsKJNrYFsfiUokPbH4BSrZtoC9m8HpoiMvYxtSE invoke [1]
  Program log: Instruction: IdlCreateAccount
  Program 11111111111111111111111111111111 invoke [2]
  Create Account: account Address { address: 81xa3F77MeurQs2pMEtv2MnusHMgpVn3h5R3DvoHZr4L, base: Some(93SnPws8ZemTMC5hCk6KpoEZ4R5zGK9izi7oVuyLJba6) } already in use
  Program 11111111111111111111111111111111 failed: custom program error: 0x0
  Program FXUQwDsKJNrYFsfiUokPbH4BSrZtoC9m8HpoiMvYxtSE consumed 9036 of 200000 compute units
  Program FXUQwDsKJNrYFsfiUokPbH4BSrZtoC9m8HpoiMvYxtSE failed: custom program error: 0x0
. Retrying...
Error creating IDL account: RPC response error -32002: Transaction simulation failed: Error processing Instruction 0: custom program error: 0x0; 7 log messages:
  Program FXUQwDsKJNrYFsfiUokPbH4BSrZtoC9m8HpoiMvYxtSE invoke [1]
  Program log: Instruction: IdlCreateAccount
  Program 11111111111111111111111111111111 invoke [2]
  Create Account: account Address { address: 81xa3F77MeurQs2pMEtv2MnusHMgpVn3h5R3DvoHZr4L, base: Some(93SnPws8ZemTMC5hCk6KpoEZ4R5zGK9izi7oVuyLJba6) } already in use
  Program 11111111111111111111111111111111 failed: custom program error: 0x0
  Program FXUQwDsKJNrYFsfiUokPbH4BSrZtoC9m8HpoiMvYxtSE consumed 9036 of 200000 compute units
  Program FXUQwDsKJNrYFsfiUokPbH4BSrZtoC9m8HpoiMvYxtSE failed: custom program error: 0x0
. Retrying...
Error creating IDL account: RPC response error -32002: Transaction simulation failed: Error processing Instruction 0: custom program error: 0x0; 7 log messages:
  Program FXUQwDsKJNrYFsfiUokPbH4BSrZtoC9m8HpoiMvYxtSE invoke [1]
  Program log: Instruction: IdlCreateAccount
  Program 11111111111111111111111111111111 invoke [2]
  Create Account: account Address { address: 81xa3F77MeurQs2pMEtv2MnusHMgpVn3h5R3DvoHZr4L, base: Some(93SnPws8ZemTMC5hCk6KpoEZ4R5zGK9izi7oVuyLJba6) } already in use
  Program 11111111111111111111111111111111 failed: custom program error: 0x0
  Program FXUQwDsKJNrYFsfiUokPbH4BSrZtoC9m8HpoiMvYxtSE consumed 9036 of 200000 compute units
  Program FXUQwDsKJNrYFsfiUokPbH4BSrZtoC9m8HpoiMvYxtSE failed: custom program error: 0x0
. Retrying...
Error creating IDL account: RPC response error -32002: Transaction simulation failed: Error processing Instruction 0: custom program error: 0x0; 7 log messages:
  Program FXUQwDsKJNrYFsfiUokPbH4BSrZtoC9m8HpoiMvYxtSE invoke [1]
  Program log: Instruction: IdlCreateAccount
  Program 11111111111111111111111111111111 invoke [2]
  Create Account: account Address { address: 81xa3F77MeurQs2pMEtv2MnusHMgpVn3h5R3DvoHZr4L, base: Some(93SnPws8ZemTMC5hCk6KpoEZ4R5zGK9izi7oVuyLJba6) } already in use
  Program 11111111111111111111111111111111 failed: custom program error: 0x0
  Program FXUQwDsKJNrYFsfiUokPbH4BSrZtoC9m8HpoiMvYxtSE consumed 9036 of 200000 compute units
  Program FXUQwDsKJNrYFsfiUokPbH4BSrZtoC9m8HpoiMvYxtSE failed: custom program error: 0x0
. Retrying...
Error creating IDL account: RPC response error -32002: Transaction simulation failed: Error processing Instruction 0: custom program error: 0x0; 7 log messages:
  Program FXUQwDsKJNrYFsfiUokPbH4BSrZtoC9m8HpoiMvYxtSE invoke [1]
  Program log: Instruction: IdlCreateAccount
  Program 11111111111111111111111111111111 invoke [2]
  Create Account: account Address { address: 81xa3F77MeurQs2pMEtv2MnusHMgpVn3h5R3DvoHZr4L, base: Some(93SnPws8ZemTMC5hCk6KpoEZ4R5zGK9izi7oVuyLJba6) } already in use
  Program 11111111111111111111111111111111 failed: custom program error: 0x0
  Program FXUQwDsKJNrYFsfiUokPbH4BSrZtoC9m8HpoiMvYxtSE consumed 9036 of 200000 compute units
  Program FXUQwDsKJNrYFsfiUokPbH4BSrZtoC9m8HpoiMvYxtSE failed: custom program error: 0x0
. Retrying...
Error creating IDL account: RPC response error -32002: Transaction simulation failed: Error processing Instruction 0: custom program error: 0x0; 7 log messages:
  Program FXUQwDsKJNrYFsfiUokPbH4BSrZtoC9m8HpoiMvYxtSE invoke [1]
  Program log: Instruction: IdlCreateAccount
  Program 11111111111111111111111111111111 invoke [2]
  Create Account: account Address { address: 81xa3F77MeurQs2pMEtv2MnusHMgpVn3h5R3DvoHZr4L, base: Some(93SnPws8ZemTMC5hCk6KpoEZ4R5zGK9izi7oVuyLJba6) } already in use
  Program 11111111111111111111111111111111 failed: custom program error: 0x0
  Program FXUQwDsKJNrYFsfiUokPbH4BSrZtoC9m8HpoiMvYxtSE consumed 9036 of 200000 compute units
  Program FXUQwDsKJNrYFsfiUokPbH4BSrZtoC9m8HpoiMvYxtSE failed: custom program error: 0x0
. Retrying...
Error creating IDL account: RPC response error -32002: Transaction simulation failed: Error processing Instruction 0: custom program error: 0x0; 7 log messages:
  Program FXUQwDsKJNrYFsfiUokPbH4BSrZtoC9m8HpoiMvYxtSE invoke [1]
  Program log: Instruction: IdlCreateAccount
  Program 11111111111111111111111111111111 invoke [2]
  Create Account: account Address { address: 81xa3F77MeurQs2pMEtv2MnusHMgpVn3h5R3DvoHZr4L, base: Some(93SnPws8ZemTMC5hCk6KpoEZ4R5zGK9izi7oVuyLJba6) } already in use
  Program 11111111111111111111111111111111 failed: custom program error: 0x0
  Program FXUQwDsKJNrYFsfiUokPbH4BSrZtoC9m8HpoiMvYxtSE consumed 9036 of 200000 compute units
  Program FXUQwDsKJNrYFsfiUokPbH4BSrZtoC9m8HpoiMvYxtSE failed: custom program error: 0x0
. Retrying...
Error creating IDL account: RPC response error -32002: Transaction simulation failed: Error processing Instruction 0: custom program error: 0x0; 7 log messages:
  Program FXUQwDsKJNrYFsfiUokPbH4BSrZtoC9m8HpoiMvYxtSE invoke [1]
  Program log: Instruction: IdlCreateAccount
  Program 11111111111111111111111111111111 invoke [2]
  Create Account: account Address { address: 81xa3F77MeurQs2pMEtv2MnusHMgpVn3h5R3DvoHZr4L, base: Some(93SnPws8ZemTMC5hCk6KpoEZ4R5zGK9izi7oVuyLJba6) } already in use
  Program 11111111111111111111111111111111 failed: custom program error: 0x0
  Program FXUQwDsKJNrYFsfiUokPbH4BSrZtoC9m8HpoiMvYxtSE consumed 9036 of 200000 compute units
  Program FXUQwDsKJNrYFsfiUokPbH4BSrZtoC9m8HpoiMvYxtSE failed: custom program error: 0x0
. Retrying...
Error creating IDL account: RPC response error -32002: Transaction simulation failed: Error processing Instruction 0: custom program error: 0x0; 7 log messages:
  Program FXUQwDsKJNrYFsfiUokPbH4BSrZtoC9m8HpoiMvYxtSE invoke [1]
  Program log: Instruction: IdlCreateAccount
  Program 11111111111111111111111111111111 invoke [2]
  Create Account: account Address { address: 81xa3F77MeurQs2pMEtv2MnusHMgpVn3h5R3DvoHZr4L, base: Some(93SnPws8ZemTMC5hCk6KpoEZ4R5zGK9izi7oVuyLJba6) } already in use
  Program 11111111111111111111111111111111 failed: custom program error: 0x0
  Program FXUQwDsKJNrYFsfiUokPbH4BSrZtoC9m8HpoiMvYxtSE consumed 9036 of 200000 compute units
  Program FXUQwDsKJNrYFsfiUokPbH4BSrZtoC9m8HpoiMvYxtSE failed: custom program error: 0x0
. Retrying...
Error creating IDL account: RPC response error -32002: Transaction simulation failed: Error processing Instruction 0: custom program error: 0x0; 7 log messages:
  Program FXUQwDsKJNrYFsfiUokPbH4BSrZtoC9m8HpoiMvYxtSE invoke [1]
  Program log: Instruction: IdlCreateAccount
  Program 11111111111111111111111111111111 invoke [2]
  Create Account: account Address { address: 81xa3F77MeurQs2pMEtv2MnusHMgpVn3h5R3DvoHZr4L, base: Some(93SnPws8ZemTMC5hCk6KpoEZ4R5zGK9izi7oVuyLJba6) } already in use
  Program 11111111111111111111111111111111 failed: custom program error: 0x0
  Program FXUQwDsKJNrYFsfiUokPbH4BSrZtoC9m8HpoiMvYxtSE consumed 9036 of 200000 compute units
  Program FXUQwDsKJNrYFsfiUokPbH4BSrZtoC9m8HpoiMvYxtSE failed: custom program error: 0x0
. Retrying...
Error creating IDL account: RPC response error -32002: Transaction simulation failed: Error processing Instruction 0: custom program error: 0x0; 7 log messages:
  Program FXUQwDsKJNrYFsfiUokPbH4BSrZtoC9m8HpoiMvYxtSE invoke [1]
  Program log: Instruction: IdlCreateAccount
  Program 11111111111111111111111111111111 invoke [2]
  Create Account: account Address { address: 81xa3F77MeurQs2pMEtv2MnusHMgpVn3h5R3DvoHZr4L, base: Some(93SnPws8ZemTMC5hCk6KpoEZ4R5zGK9izi7oVuyLJba6) } already in use
  Program 11111111111111111111111111111111 failed: custom program error: 0x0
  Program FXUQwDsKJNrYFsfiUokPbH4BSrZtoC9m8HpoiMvYxtSE consumed 9036 of 200000 compute units
  Program FXUQwDsKJNrYFsfiUokPbH4BSrZtoC9m8HpoiMvYxtSE failed: custom program error: 0x0
. Retrying...
Error creating IDL account: RPC response error -32002: Transaction simulation failed: Error processing Instruction 0: custom program error: 0x0; 7 log messages:
  Program FXUQwDsKJNrYFsfiUokPbH4BSrZtoC9m8HpoiMvYxtSE invoke [1]
  Program log: Instruction: IdlCreateAccount
  Program 11111111111111111111111111111111 invoke [2]
  Create Account: account Address { address: 81xa3F77MeurQs2pMEtv2MnusHMgpVn3h5R3DvoHZr4L, base: Some(93SnPws8ZemTMC5hCk6KpoEZ4R5zGK9izi7oVuyLJba6) } already in use
  Program 11111111111111111111111111111111 failed: custom program error: 0x0
  Program FXUQwDsKJNrYFsfiUokPbH4BSrZtoC9m8HpoiMvYxtSE consumed 9036 of 200000 compute units
  Program FXUQwDsKJNrYFsfiUokPbH4BSrZtoC9m8HpoiMvYxtSE failed: custom program error: 0x0
. Retrying...
Error creating IDL account: RPC response error -32002: Transaction simulation failed: Error processing Instruction 0: custom program error: 0x0; 7 log messages:
  Program FXUQwDsKJNrYFsfiUokPbH4BSrZtoC9m8HpoiMvYxtSE invoke [1]
  Program log: Instruction: IdlCreateAccount
  Program 11111111111111111111111111111111 invoke [2]
  Create Account: account Address { address: 81xa3F77MeurQs2pMEtv2MnusHMgpVn3h5R3DvoHZr4L, base: Some(93SnPws8ZemTMC5hCk6KpoEZ4R5zGK9izi7oVuyLJba6) } already in use
  Program 11111111111111111111111111111111 failed: custom program error: 0x0
  Program FXUQwDsKJNrYFsfiUokPbH4BSrZtoC9m8HpoiMvYxtSE consumed 9036 of 200000 compute units
  Program FXUQwDsKJNrYFsfiUokPbH4BSrZtoC9m8HpoiMvYxtSE failed: custom program error: 0x0
. Retrying...
Error creating IDL account: RPC response error -32002: Transaction simulation failed: Error processing Instruction 0: custom program error: 0x0; 7 log messages:
  Program FXUQwDsKJNrYFsfiUokPbH4BSrZtoC9m8HpoiMvYxtSE invoke [1]
  Program log: Instruction: IdlCreateAccount
  Program 11111111111111111111111111111111 invoke [2]
  Create Account: account Address { address: 81xa3F77MeurQs2pMEtv2MnusHMgpVn3h5R3DvoHZr4L, base: Some(93SnPws8ZemTMC5hCk6KpoEZ4R5zGK9izi7oVuyLJba6) } already in use
  Program 11111111111111111111111111111111 failed: custom program error: 0x0
  Program FXUQwDsKJNrYFsfiUokPbH4BSrZtoC9m8HpoiMvYxtSE consumed 9036 of 200000 compute units
  Program FXUQwDsKJNrYFsfiUokPbH4BSrZtoC9m8HpoiMvYxtSE failed: custom program error: 0x0
. Retrying...
Error: Error creating IDL account: RPC response error -32002: Transaction simulation failed: Error processing Instruction 0: custom program error: 0x0; 7 log messages:
  Program FXUQwDsKJNrYFsfiUokPbH4BSrZtoC9m8HpoiMvYxtSE invoke [1]
  Program log: Instruction: IdlCreateAccount
  Program 11111111111111111111111111111111 invoke [2]
  Create Account: account Address { address: 81xa3F77MeurQs2pMEtv2MnusHMgpVn3h5R3DvoHZr4L, base: Some(93SnPws8ZemTMC5hCk6KpoEZ4R5zGK9izi7oVuyLJba6) } already in use
  Program 11111111111111111111111111111111 failed: custom program error: 0x0
  Program FXUQwDsKJNrYFsfiUokPbH4BSrZtoC9m8HpoiMvYxtSE consumed 9036 of 200000 compute units
  Program FXUQwDsKJNrYFsfiUokPbH4BSrZtoC9m8HpoiMvYxtSE failed: custom program error: 0x0


https://www.rareskills.io/post/solana-anchor-deploy

anchor test --skip-deploy

anchor test --skip-local-validator --skip-deploy



to deploy your idl you need to:
anchor idl init -f <target/idl/program.json> <program-id>

to update a deployed idl:
anchor idl upgrade <program-id> -f <target/idl/program.json>

anchor idl upgrade FXUQwDsKJNrYFsfiUokPbH4BSrZtoC9m8HpoiMvYxtSE -f target/idl/marketplace.json
Idl data length: 1375 bytes
Step 0/1375 
Step 600/1375 
Step 1200/1375 
Idl account 81xa3F77MeurQs2pMEtv2MnusHMgpVn3h5R3DvoHZr4L successfully upgraded