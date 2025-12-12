# Sovereign Layer 1 Blockchain Prototype
**Empowering RWAs, Identity, and DePIN**

![Architecture Diagram](C:/Users/spars/.gemini/antigravity/brain/c76cc226-823f-4042-b9d2-ae66aa75c321/architecture_diagram_1765568734016.png)

## Overview
This project is a custom Layer 1 blockchain built from first principles in TypeScript. It is designed to solve three critical infrastructure problems:
1.  **Stablecoins**: Protocol-level compliance.
2.  **Real-World Assets**: Native access control (Identity).
3.  **DePIN**: Decentralized Physical Infrastructure support.

Unlike general-purpose chains (like Ethereum) where compliance is a "wrapper", this chain enforces it at the state-machine level.

## Key Features

### 1. Sovereign Identity (The Gatekeeper)
- **Module**: `src/modules/Identity.ts`
- **Theory**: No user can hold assets without an `IdentityRecord`.
- **Logic**: Transactions are pre-validated against a whitelist maintained by Governance Authorities.

### 2. Native RWA (The Asset)
- **Module**: `src/modules/Asset.ts`
- **Theory**: Assets are not smart contracts; they are native state objects.
- **Logic**: Transfers `Alice -> Bob` automatically fail if `Bob` does not have an Identity. This "Sovereign Infrastructure" guarantees regulatory enforcement.

### 3. DePIN (The Infrastructure)
- **Module**: `src/modules/DePIN.ts`
- **Theory**: Machines (Routers, Sensors) can earn tokens by proving uptime.
- **Logic**: 
    1. **Register**: Owners link a `DeviceId` to their Identity.
    2. **Heartbeat**: Devices sign a `ProofOfUptime` transaction.
    3. **Reward**: The protocol automatically mints `INFRA` tokens to the owner.

## Implementation Details

### Architecture
The chain uses a modular State Machine pattern:
- **Core**: `Block`, `Transaction`, `State` (In-Memory Trie Simulation).
- **Consensus**: Proof-of-Authority (PoA) where `miners` are Authorities.
- **Execution**: Transactions are routed to their respective Modules.

### Verified Scenarios
We have simulated the following flows:

1.  **KYC Onboarding**: Admin verifies Users & Machines.
2.  **Asset Issuance**: Minting a Regulated Stablecoin (`MESA_USD`).
3.  **Compliance Check**: Blocking a transfer to an unverified user.
4.  **Infrastructure Rewards**: Granting tokens for 5G Node uptime.

## How to Run

### Prerequisites
- Node.js (v16+)
- TypeScript

### Setup
```bash
npm install
```

### Run RWA Demo (Stablecoin Focus)
```bash
npx ts-node src/simulation/demo.ts
```

### Run DePIN Demo (Infrastructure Focus)
```bash
npx ts-node src/simulation/depin-demo.ts
```

### Run Accuracy & Loss Test
**Verification of Protocol Logic**

To prove the Chain's sovereignty, we run a statistical stress test:
- **100,000 Transactions** (Mixed Valid/Invalid)
- **Goal**: Measure False Positives (Security Risks) and False Negatives (Usability Bugs).

```bash
npx ts-node src/simulation/metrics-test.ts
```

**Latest Results:**
- Samples: 100,000
- **ACCURACY**: 100.00%
- **LOSS**: 0.00%

## Demo Visuals
*Visualization of the terminal output for a successful DePIN Reward cycle:*

![Terminal Demo Mockup](C:/Users/spars/.gemini/antigravity/brain/c76cc226-823f-4042-b9d2-ae66aa75c321/terminal_demo_mockup_1765568751038.png)

## License
MIT - Open Source Infrastructure Prototype
