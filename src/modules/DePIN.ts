import { State } from '../core/State';
import { Transaction, TransactionType } from '../core/Transaction';
import { AssetModule } from './Asset';
import { IdentityModule } from './Identity';

export interface DeviceRecord {
    deviceId: string;
    owner: string;
    type: string;
    status: 'ACTIVE' | 'INACTIVE';
    lastHeartbeat: number;
}

export class DePINModule {
    private state: State;
    private assetModule: AssetModule;
    private identityModule: IdentityModule;

    // Reward settings
    private static REWARD_AMOUNT = 10;
    private static REWARD_ASSET = "INFRA";

    constructor(state: State, assetModule: AssetModule, identityModule: IdentityModule) {
        this.state = state;
        this.assetModule = assetModule;
        this.identityModule = identityModule;
    }

    public processTransaction(tx: Transaction): void {
        const payload = tx.payload;

        if (payload.type === TransactionType.DEVICE_REGISTER) {
            this.handleRegistration(tx);
        } else if (payload.type === TransactionType.DEVICE_HEARTBEAT) {
            this.handleHeartbeat(tx);
        }
    }

    private handleRegistration(tx: Transaction) {
        const { deviceId, type } = tx.payload.data;
        const owner = tx.senderPublicKey;

        // Compliance: Owner must be KYC verified to run infrastructure
        if (!this.identityModule.hasValidIdentity(owner)) {
            throw new Error("DePIN Error: Device owner not verified");
        }

        const key = `device:${deviceId}`;
        if (this.state.get(key)) {
            throw new Error("Device already registered");
        }

        const record: DeviceRecord = {
            deviceId,
            owner,
            type,
            status: 'ACTIVE',
            lastHeartbeat: tx.timestamp
        };

        this.state.put(key, record);
        console.log(`[DePIN] Registered Device ${deviceId} (Type: ${type}) for owner ${owner.substring(0, 8)}...`);
    }

    private handleHeartbeat(tx: Transaction) {
        const { deviceId, uptimeMetrics } = tx.payload.data;

        // In reality, the TX should be signed by the DEVICE KEY, not the owner.
        // For prototype simplicity, we assume tx.sender is the Device or Owner acting for it.
        // Let's verify the device exists.
        const record = this.state.get(`device:${deviceId}`);
        if (!record) {
            throw new Error("Unknown Device");
        }

        // Update heartbeat
        record.lastHeartbeat = tx.timestamp;
        this.state.put(`device:${deviceId}`, record);

        // Distribute Rewards
        // Mint INFRA tokens to the owner
        // We bypass the generic issuance check because this is Protocol Minting
        this.mintReward(record.owner);

        console.log(`[DePIN] Heartbeat verified for ${deviceId}. Reward sent to ${record.owner.substring(0, 8)}...`);
    }

    private mintReward(beneficiary: string) {
        // Direct state manipulation for protocol rewards
        const currentBal = this.assetModule.getBalance(DePINModule.REWARD_ASSET, beneficiary);
        // We use a private interface or helper in a real system. 
        // Here we just access state directly via AssetModule key convention for prototype speed.

        // Note: In strict OOP, AssetModule should expose a 'mint' method restricted to modules.
        // We will simulate that by direct state write for now to avoid refactoring AssetModule heavily.
        const key = `balance:${DePINModule.REWARD_ASSET}:${beneficiary}`;
        this.state.put(key, currentBal + DePINModule.REWARD_AMOUNT);
    }
}
