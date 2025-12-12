import { State } from '../core/State';
import { Transaction, TransactionType } from '../core/Transaction';
import { IdentityModule } from './Identity';

export interface Asset {
    symbol: string;
    totalSupply: number;
    owner: string; // Issuer
    balances: Map<string, number>; // In-memory map for the prototype (simplified)
}

export class AssetModule {
    private state: State;
    private identityModule: IdentityModule;

    constructor(state: State, identityModule: IdentityModule) {
        this.state = state;
        this.identityModule = identityModule;
    }

    public getBalance(symbol: string, owner: string): number {
        const balKey = `balance:${symbol}:${owner}`;
        return this.state.get(balKey) || 0;
    }

    private setBalance(symbol: string, owner: string, amount: number) {
        this.state.put(`balance:${symbol}:${owner}`, amount);
    }

    public processTransaction(tx: Transaction): void {
        const payload = tx.payload;

        if (payload.type === TransactionType.ASSET_ISSUANCE) {
            this.handleIssuance(tx);
        } else if (payload.type === TransactionType.ASSET_TRANSFER) {
            this.handleTransfer(tx);
        }
    }

    private handleIssuance(tx: Transaction) {
        // Only Verified users can issue assets? Or specific permissions?
        // Let's say anyone Verified can Validly issue an Asset for this demo
        if (!this.identityModule.hasValidIdentity(tx.senderPublicKey)) {
            throw new Error("Compliance Error: Issuer is not verified");
        }

        const { symbol, supply } = tx.payload.data;
        const assetKey = `asset:${symbol}`;

        if (this.state.get(assetKey)) {
            throw new Error(`Asset ${symbol} already exists`);
        }

        // Create Asset
        this.state.put(assetKey, {
            symbol,
            totalSupply: supply,
            owner: tx.senderPublicKey
        });

        // credit issuer
        this.setBalance(symbol, tx.senderPublicKey, supply);
        console.log(`[Asset] Issued ${supply} ${symbol} to ${tx.senderPublicKey.substring(0, 8)}...`);
    }

    private handleTransfer(tx: Transaction) {
        const { symbol, to, amount } = tx.payload.data;

        // 1. Check Sender Balance
        const senderBal = this.getBalance(symbol, tx.senderPublicKey);
        if (senderBal < amount) {
            throw new Error("Insufficient Balance");
        }

        // 2. COMPLIANCE CHECK: Receiver must be Verified
        // This is the "Sovereign Infrastructure" feature
        if (!this.identityModule.hasValidIdentity(to)) {
            throw new Error(`Compliance Error: Receiver ${to.substring(0, 8)} is not KYC verified`);
        }

        // 3. Execute Transfer
        this.setBalance(symbol, tx.senderPublicKey, senderBal - amount);
        const receiverBal = this.getBalance(symbol, to);
        this.setBalance(symbol, to, receiverBal + amount);

        console.log(`[Asset] Transferred ${amount} ${symbol} from ${tx.senderPublicKey.substring(0, 8)} to ${to.substring(0, 8)}`);
    }
}
