import * as crypto from 'crypto';

export function computeHash(data: string | Buffer): string {
    return crypto.createHash('sha256').update(data).digest('hex');
}

export function generateRandomId(): string {
    return crypto.randomBytes(16).toString('hex');
}
