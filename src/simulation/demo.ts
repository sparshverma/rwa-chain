import { Blockchain } from '../core/Blockchain';
import { Transaction, TransactionType } from '../core/Transaction';

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

async function runDemo() {
    console.log("=== WRAPPED_BTC (wBTC) RWA CHAIN SIOVEREIGNTY DEMO ===");

    // 1. Setup Chain
    const chain = new Blockchain();

    // Actors
    const GOV_ADMIN = "Key_Governance_Admin";
    const ISSUER = "Key_RealEstate_Issuer";
    const ALICE = "Key_Alice_Verified";
    const BOB = "Key_Bob_Verified";
    const EVE = "Key_Eve_Unverified"; // The unauthorized user

    // Bootstrap: Admin is the first Authority
    chain.identityModule.addAuthority(GOV_ADMIN);
    console.log(`[Setup] Governance Admin initialized: ${GOV_ADMIN}`);

    // 2. Identity Verification Process (KYC)
    console.log("\n--- STEP 1: IDENTITY VERIFICATION (KYC) ---");

    // Admin verifies Issuer, Alice, and Bob
    const kycTxs = [
        new Transaction(GOV_ADMIN, {
            type: TransactionType.IDENTITY_CLAIM,
            data: { targetUser: ISSUER, action: 'VERIFY', attributes: { role: 'ISSUER' } }
        }),
        new Transaction(GOV_ADMIN, {
            type: TransactionType.IDENTITY_CLAIM,
            data: { targetUser: ALICE, action: 'VERIFY', attributes: { country: 'US' } }
        }),
        new Transaction(GOV_ADMIN, {
            type: TransactionType.IDENTITY_CLAIM,
            data: { targetUser: BOB, action: 'VERIFY', attributes: { country: 'UK' } }
        })
    ];

    kycTxs.forEach(tx => chain.addTransaction(tx));
    chain.minePendingTransactions(GOV_ADMIN); // Admin also validates the block
    console.log("Block 1 Mined: Identities Verified.");

    // 3. Asset Issuance
    console.log("\n--- STEP 2: ASSET ISSUANCE ---");
    const issuanceTx = new Transaction(ISSUER, {
        type: TransactionType.ASSET_ISSUANCE,
        data: { symbol: 'MESA_USD', supply: 1000000 }
    });

    chain.addTransaction(issuanceTx);
    chain.minePendingTransactions(GOV_ADMIN);
    console.log("Block 2 Mined: MESA_USD Issued.");

    // Check Balance
    console.log(`Issuer Balance: ${chain.assetModule.getBalance('MESA_USD', ISSUER)} MESA_USD`);

    // 4. Compliant Transfer (Issuer -> Alice)
    console.log("\n--- STEP 3: COMPLIANT TRANSFER (Issuer -> Alice) ---");
    const tx1 = new Transaction(ISSUER, {
        type: TransactionType.ASSET_TRANSFER,
        data: { symbol: 'MESA_USD', to: ALICE, amount: 500 }
    });
    chain.addTransaction(tx1);
    chain.minePendingTransactions(GOV_ADMIN);
    console.log(`Alice Balance: ${chain.assetModule.getBalance('MESA_USD', ALICE)} MESA_USD`);

    // 5. Compliant Transfer (Alice -> Bob)
    console.log("\n--- STEP 4: COMPLIANT TRANSFER (Alice -> Bob) ---");
    const tx2 = new Transaction(ALICE, {
        type: TransactionType.ASSET_TRANSFER,
        data: { symbol: 'MESA_USD', to: BOB, amount: 100 }
    });
    chain.addTransaction(tx2);
    chain.minePendingTransactions(GOV_ADMIN);
    console.log(`Bob Balance: ${chain.assetModule.getBalance('MESA_USD', BOB)} MESA_USD`);

    // 6. NON-COMPLIANT TRANSFER (Bob -> Eve)
    // Eve is NOT verified. Protocol should reject this.
    console.log("\n--- STEP 5: ATTEMPTING ILLEGAL TRANSFER (Bob -> Eve [Unverified]) ---");
    const tx3 = new Transaction(BOB, {
        type: TransactionType.ASSET_TRANSFER,
        data: { symbol: 'MESA_USD', to: EVE, amount: 50 }
    });
    chain.addTransaction(tx3);

    // Mine block - this should trigger the rejection log
    chain.minePendingTransactions(GOV_ADMIN);

    const eveBal = chain.assetModule.getBalance('MESA_USD', EVE);
    console.log(`Eve Balance: ${eveBal} MESA_USD (Should be 0)`);
    console.log(`Bob Balance: ${chain.assetModule.getBalance('MESA_USD', BOB)} MESA_USD (Should be 100 - refund not implemented but tx failed)`);

    console.log("\n=== DEMO COMPLETE ===");
}

runDemo();
