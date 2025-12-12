import { Blockchain } from '../core/Blockchain';
import { Transaction, TransactionType } from '../core/Transaction';

async function runDePinDemo() {
    console.log("=== DEPIN (INFRASTRUCTURE) CHAIN DEMO ===");

    // 1. Setup Chain
    const chain = new Blockchain();

    // Actors
    const GOV_ADMIN = "Key_Governance_Admin";
    const INTERNET_PROVIDER_A = "Key_Provider_A_Verified"; // A telecom company
    const BOB_HOST = "Key_Bob_Verified"; // Hosting a 5G node
    const ROGUE_NODE = "Key_BadActor";

    // Setup: Admin verifies Provider and Bob
    chain.identityModule.addAuthority(GOV_ADMIN);

    const kycTxs = [
        new Transaction(GOV_ADMIN, {
            type: TransactionType.IDENTITY_CLAIM,
            data: { targetUser: INTERNET_PROVIDER_A, action: 'VERIFY', attributes: { role: 'ISP' } }
        }),
        new Transaction(GOV_ADMIN, {
            type: TransactionType.IDENTITY_CLAIM,
            data: { targetUser: BOB_HOST, action: 'VERIFY', attributes: { role: 'HOST' } }
        })
    ];
    kycTxs.forEach(tx => chain.addTransaction(tx));
    chain.minePendingTransactions(GOV_ADMIN);
    console.log("Block 1: Identities Verified (ISP & Host).");

    // 2. Device Registration
    console.log("\n--- STEP 1: REGISTERING INFRASTRUCTURE ---");
    // Bob registers a 5G Hotspot
    const DEVICE_ID = "5G_NODE_SERIAL_8822";

    const regTx = new Transaction(BOB_HOST, {
        type: TransactionType.DEVICE_REGISTER,
        data: { deviceId: DEVICE_ID, type: "5G_HOTSPOT" }
    });

    chain.addTransaction(regTx);
    chain.minePendingTransactions(GOV_ADMIN);
    console.log("Block 2: Device Registered.");

    // 3. Heartbeat & Rewards (Success)
    console.log("\n--- STEP 2: PROOF OF UPTIME (HEARTBEAT) ---");
    // Device sends heartbeat
    const heartbeatTx = new Transaction(BOB_HOST, { // In reality, signed by device key, authorized by owner
        type: TransactionType.DEVICE_HEARTBEAT,
        data: { deviceId: DEVICE_ID, uptimeMetrics: { bandwidth: "1Gbps", latency: "12ms" } }
    });

    chain.addTransaction(heartbeatTx);
    chain.minePendingTransactions(GOV_ADMIN);

    // Check Rewards
    const bal = chain.assetModule.getBalance("INFRA", BOB_HOST);
    console.log(`Bob's Balance: ${bal} INFRA (Reward Received)`);

    // 4. Unauthorized Heartbeat (Fail)
    console.log("\n--- STEP 3: UNAUTHORIZED DEVICE (FAIL) ---");
    const fakeTx = new Transaction(ROGUE_NODE, {
        type: TransactionType.DEVICE_HEARTBEAT,
        data: { deviceId: "FAKE_DEVICE_99", uptimeMetrics: {} }
    });
    chain.addTransaction(fakeTx);
    chain.minePendingTransactions(GOV_ADMIN);
    // Should see error log
}

runDePinDemo();
