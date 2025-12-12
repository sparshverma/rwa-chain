import { Block } from './Block';
import { Transaction } from './Transaction';
import { State } from './State';
import { IdentityModule } from '../modules/Identity';
import { AssetModule } from '../modules/Asset';

import { DePINModule } from '../modules/DePIN';

export class Blockchain {
    public chain: Block[];
    public state: State;
    public identityModule: IdentityModule;
    public assetModule: AssetModule;
    public depinModule: DePINModule;
    public pendingTransactions: Transaction[];

    constructor() {
        this.chain = [Block.genesis()];
        this.state = new State();

        // Modules
        this.identityModule = new IdentityModule(this.state);
        this.assetModule = new AssetModule(this.state, this.identityModule);
        this.depinModule = new DePINModule(this.state, this.assetModule, this.identityModule);

        this.pendingTransactions = [];
    }

    public getLatestBlock(): Block {
        return this.chain[this.chain.length - 1];
    }

    public addTransaction(tx: Transaction): void {
        // Basic signature check (mocked) would go here
        this.pendingTransactions.push(tx);
    }

    public minePendingTransactions(validatorPublicKey: string): void {
        const latestBlock = this.getLatestBlock();

        // Execute Transactions against State Machine
        // In a real generic chain, we'd have a VM. Here we route to specific modules.
        const validTxs: Transaction[] = [];

        for (const tx of this.pendingTransactions) {
            try {
                // Route to appropriate module
                // We could use a map or switch.
                this.identityModule.processTransaction(tx);
                this.assetModule.processTransaction(tx);
                this.depinModule.processTransaction(tx);

                // If no error thrown, it's valid
                validTxs.push(tx);
            } catch (e: any) {
                console.log(`[Consensus] Dropping invalid tx ${tx.id.substring(0, 6)}: ${e.message}`);
                // Don't include invalid txs in block (or include as failed status in real EVM)
            }
        }

        const newBlock = new Block(
            latestBlock.index + 1,
            latestBlock.hash,
            Date.now(),
            validTxs,
            validatorPublicKey
        );

        this.chain.push(newBlock);
        this.pendingTransactions = []; // Clear mempool
    }
}
