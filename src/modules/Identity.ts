import { State } from '../core/State';
import { Transaction, TransactionType } from '../core/Transaction';

export enum IdentityStatus {
    NONE = 'NONE',
    PENDING = 'PENDING',
    VERIFIED = 'VERIFIED',
    REVOKED = 'REVOKED'
}

export interface IdentityRecord {
    publicKey: string;
    status: IdentityStatus;
    did: string; // Decentralized ID
    attributes: Record<string, string>; // e.g., "country": "US", "accredited": "true"
}

export class IdentityModule {
    private state: State;
    // Hardcoded authorities for this prototype
    private authorities: Set<string>;

    constructor(state: State) {
        this.state = state;
        this.authorities = new Set();
    }

    public addAuthority(publicKey: string) {
        this.authorities.add(publicKey);
    }

    public getIdentity(publicKey: string): IdentityRecord | null {
        return this.state.get(`identity:${publicKey}`) || null;
    }

    public hasValidIdentity(publicKey: string): boolean {
        const record = this.getIdentity(publicKey);
        return record !== null && record.status === IdentityStatus.VERIFIED;
    }

    public processTransaction(tx: Transaction): void {
        if (tx.payload.type !== TransactionType.IDENTITY_CLAIM) return;

        // In a real Identity Module:
        // 1. User submits a claim signed by an Authority?
        // 2. OR Authority submits a TX to verify a user?

        // Model: Authority signs a "Grant Verification" TX for a user.
        // Check if sender is an Authority
        if (!this.authorities.has(tx.senderPublicKey)) {
            throw new Error("Unauthorized: Only authorities can manage identities");
        }

        const { targetUser, action, did, attributes } = tx.payload.data;

        if (action === 'VERIFY') {
            const record: IdentityRecord = {
                publicKey: targetUser,
                status: IdentityStatus.VERIFIED,
                did: did || `did:rwa:${targetUser.substring(0, 8)}`,
                attributes: attributes || {}
            };
            this.state.put(`identity:${targetUser}`, record);
            console.log(`[Identity] Verified user ${targetUser.substring(0, 8)}...`);
        } else if (action === 'REVOKE') {
            const record = this.getIdentity(targetUser);
            if (record) {
                record.status = IdentityStatus.REVOKED;
                this.state.put(`identity:${targetUser}`, record);
            }
        }
    }
}
