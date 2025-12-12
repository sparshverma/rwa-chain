import { Blockchain } from '../core/Blockchain';
import { Transaction, TransactionType } from '../core/Transaction';

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

async function runMetricsTest() {
    console.log("=== COMPLIANCE ACCURACY & LOSS TESTING ===");
    console.log("Generating batch traffic...");

    const chain = new Blockchain();
    const ADMIN = "Key_Admin";
    chain.identityModule.addAuthority(ADMIN);

    // Setup actors
    // 5 Verified, 5 Unverified
    const verifiedUsers: string[] = [];
    for (let i = 0; i < 5; i++) {
        const u = `User_Verified_${i}`;
        verifiedUsers.push(u);
        chain.identityModule.processTransaction(new Transaction(ADMIN, {
            type: TransactionType.IDENTITY_CLAIM,
            data: { targetUser: u, action: 'VERIFY' }
        }));
    }

    const unverifiedUsers: string[] = [];
    for (let i = 0; i < 5; i++) {
        unverifiedUsers.push(`User_Rogue_${i}`);
    }

    // Give everyone some starting balance (Requires Issue -> Transfer workaround or direct mint)
    // For test speed, we'll hack the state to fund verified users directly
    verifiedUsers.forEach(u => chain.assetModule["setBalance"]("TEST_TOKEN", u, 1000));
    // Unverified users have 0 balance anyway, so they can't send, but we'll test RECEIVING limits mostly.

    // TEST PARAMETERS
    const TOTAL_TESTS = 100000;
    let expectedSuccess = 0;
    let expectedFail = 0;

    // Generate Random Transactions
    for (let i = 0; i < TOTAL_TESTS; i++) {
        const isLegal = Math.random() > 0.5;
        const sender = verifiedUsers[Math.floor(Math.random() * verifiedUsers.length)];

        let tx: Transaction;

        if (isLegal) {
            // Valid Transfer: Verified -> Verified
            const receiver = verifiedUsers[Math.floor(Math.random() * verifiedUsers.length)];
            tx = new Transaction(sender, {
                type: TransactionType.ASSET_TRANSFER,
                data: { symbol: 'TEST_TOKEN', to: receiver, amount: 1 }
            });
            expectedSuccess++;
            // Attach expected result to tx for tracking (simulated metadata)
            (tx as any)._expected = 'SUCCESS';
        } else {
            // Illegal Transfer: Verified -> Unverified
            const receiver = unverifiedUsers[Math.floor(Math.random() * unverifiedUsers.length)];
            tx = new Transaction(sender, {
                type: TransactionType.ASSET_TRANSFER,
                data: { symbol: 'TEST_TOKEN', to: receiver, amount: 1 }
            });
            expectedFail++;
            (tx as any)._expected = 'FAIL';
        }

        chain.addTransaction(tx);
    }

    // Run Consensus
    console.log(`Processing ${TOTAL_TESTS} transactions...`);
    // Mine transactions and capture logs/filtering
    // We need to peek into the mining process or check mempool before and after

    // Custom mining wrapper to count results
    const initialPool = [...chain.pendingTransactions];

    // To measure "Accuracy", we need to see if the Logic correctly accepted/rejected.
    // We can simulate processing one by one.

    let truePositives = 0; // Legal Allowed
    let trueNegatives = 0; // Illegal Blocked
    let falsePositives = 0; // Illegal Allowed (Critical Failure)
    let falseNegatives = 0; // Legal Blocked (Bug)

    for (const tx of initialPool) {
        const expected = (tx as any)._expected;
        let actual = 'FAIL';

        try {
            // Dry run checks
            chain.identityModule.processTransaction(tx);
            if (tx.payload.type === TransactionType.ASSET_TRANSFER) {
                // We need to re-implement the check logic here or wrap the module to catch errors?
                // Actually, let's just let the chain mine it.
                // If it ends up in the block -> It was accepted.
            }
        } catch (e) { }
    }

    // Let's actually mine a block and see what got in
    chain.minePendingTransactions(ADMIN);
    const block = chain.getLatestBlock();
    const acceptedIds = new Set(block.transactions.map(t => t.id));

    initialPool.forEach(tx => {
        const expected = (tx as any)._expected;
        const wasAccepted = acceptedIds.has(tx.id);

        if (expected === 'SUCCESS' && wasAccepted) {
            truePositives++;
        } else if (expected === 'FAIL' && !wasAccepted) {
            trueNegatives++;
        } else if (expected === 'FAIL' && wasAccepted) {
            falsePositives++;
            console.error(`[CRITICAL] Illegal TX Accepted: ${tx.id}`);
        } else if (expected === 'SUCCESS' && !wasAccepted) {
            falseNegatives++;
            console.error(`[BUG] Legal TX Rejected: ${tx.id}`);
        }
    });

    // CALCULATE METRICS
    const totalCorrect = truePositives + trueNegatives;
    const accuracy = (totalCorrect / TOTAL_TESTS) * 100;
    const loss = ((TOTAL_TESTS - totalCorrect) / TOTAL_TESTS) * 100;

    console.log("\n=== RESULTS ===");
    console.log(`Total Samples: ${TOTAL_TESTS}`);
    console.log(`Valid Scenarios (Expected Pass): ${expectedSuccess}`);
    console.log(`Compliance Scenarios (Expected Fail): ${expectedFail}`);
    console.log("--------------------------------");
    console.log(`Correctly Processed: ${totalCorrect}`);
    console.log(`Errors: ${TOTAL_TESTS - totalCorrect}`);
    console.log("--------------------------------");
    console.log(`ACCURACY PERCENTAGE: ${accuracy.toFixed(2)}%`); // Should be 100%
    console.log(`LOSS PERCENTAGE:     ${loss.toFixed(2)}%`);     // Should be 0%

    if (accuracy === 100) {
        console.log("\n[PASSED] System Logic is Perfect.");
    } else {
        console.log("\n[FAILED] Logic Errors Detected.");
    }
}

// Helper to allow access to private balance for setup
// In real JS/TS private is soft at runtime
// Suppressed for demo code
runMetricsTest();
