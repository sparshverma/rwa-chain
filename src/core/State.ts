// Simulate a Merkle Patricia Trie or LevelDB
export class State {
    private storage: Map<string, any> = new Map();

    constructor() { }

    public put(key: string, value: any): void {
        this.storage.set(key, value);
    }

    public get(key: string): any {
        return this.storage.get(key);
    }

    // In a real chain, we'd have a root hash calculation here
    public getRootHash(): string {
        // Mock implementation
        const keys = Array.from(this.storage.keys()).sort().join('');
        return require('../crypto/Hash').computeHash(keys);
    }
}
