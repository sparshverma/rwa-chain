import { computeHash } from '../crypto/Hash';
import { Transaction } from './Transaction';

export class Block {
    public readonly index: number;
    public readonly previousHash: string;
    public readonly timestamp: number;
    public readonly transactions: Transaction[];
    public readonly generator: string; // Public key of validator
    public readonly hash: string;

    constructor(
        index: number,
        previousHash: string,
        timestamp: number,
        transactions: Transaction[],
        generator: string
    ) {
        this.index = index;
        this.previousHash = previousHash;
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.generator = generator;
        this.hash = this.calculateHash();
    }

    public calculateHash(): string {
        const data = JSON.stringify({
            index: this.index,
            prev: this.previousHash,
            ts: this.timestamp,
            // Map txs to their IDs to keep block header light-ish, or full merkle root in real L1
            txs: this.transactions.map(t => t.id),
            gen: this.generator
        });
        return computeHash(data);
    }

    public static genesis(): Block {
        return new Block(0, "0".repeat(64), Date.now(), [], "GENESIS");
    }
}
