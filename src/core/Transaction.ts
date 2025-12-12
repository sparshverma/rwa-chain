export enum TransactionType {
    IDENTITY_CLAIM = 'IDENTITY_CLAIM',
    ASSET_ISSUANCE = 'ASSET_ISSUANCE',
    ASSET_TRANSFER = 'ASSET_TRANSFER',
    VALIDATOR_VOTE = 'VALIDATOR_VOTE',
    DEVICE_REGISTER = 'DEVICE_REGISTER',
    DEVICE_HEARTBEAT = 'DEVICE_HEARTBEAT'
}

export interface TransactionPayload {
    type: TransactionType;
    data: any;
}

export class Transaction {
    public readonly id: string;
    public readonly senderPublicKey: string;
    public readonly payload: TransactionPayload;
    public readonly timestamp: number;
    public signature: string | null;

    constructor(senderPublicKey: string, payload: TransactionPayload, timestamp: number = Date.now()) {
        this.senderPublicKey = senderPublicKey;
        this.payload = payload;
        this.timestamp = timestamp;
        this.signature = null;
        // ID is hash of contents (unsigned)
        this.id = this.calculateHash();
    }

    public calculateHash(): string {
        // Simple JSON serialization for hash
        // In prod, use canonical serialization (e.g., protobuf or RLP)
        const data = JSON.stringify({
            sender: this.senderPublicKey,
            payload: this.payload,
            ts: this.timestamp
        });
        // We need to circle back to import computeHash, but avoiding circular dep issues.
        // For now, I'll inject the hasher or use a clean import structure.
        // Let's rely on a utility import. We will fix imports in a second pass if needed.
        return require('../crypto/Hash').computeHash(data);
    }

    public sign(secretKey: string): void {
        // Implementation TODO after adding elliptic
        this.signature = "placeholder_sig_" + secretKey;
    }
}
