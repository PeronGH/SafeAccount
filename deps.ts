import { DB } from 'https://deno.land/x/sqlite@v3.5.0/mod.ts';

export const db = new DB('db/user.db');

export const initSQL = [
    `CREATE TABLE IF NOT EXISTS users (
        name TEXT UNIQUE NOT NULL CHECK(LENGTH(name) >= 2),
        uuid TEXT PRIMARY KEY CHECK(LENGTH(uuid) = 36),
        hash TEXT NOT NULL CHECK(LENGTH(hash) = 64)
    ) STRICT`,
    `CREATE TABLE IF NOT EXISTS auth_entries (
        user_id TEXT NOT NULL,
        token TEXT PRIMARY KEY CHECK(LENGTH(token) = 36),
        valid_before INTEGER,
        is_revoke INTEGER NOT NULL CHECK(is_revoke IN (0, 1)),
        CONSTRAINT ref_uuid FOREIGN KEY (user_id) REFERENCES users (uuid)
    ) STRICT`,
];

export const initDB = () => db.execute(initSQL.join(';'));

export const tables = ['users', 'auth_entries'];

export const clearDB = () =>
    db.execute(
        tables
            .reverse()
            .map(table => `DROP TABLE IF EXISTS ${table}`)
            .join(';')
    );

export type User = { name: string; hash: string; uuid: string };

export type AuthEntry = {
    user_id: string;
    token: string;
    valid_before?: number;
    is_revoke?: boolean;
};

const encoder = new TextEncoder();

export async function sha256(text: string): Promise<string> {
    const buffer = encoder.encode(text);
    const result = await crypto.subtle.digest({ name: 'SHA-256' }, buffer);
    return [...new Uint8Array(result)]
        .map(x => x.toString(16).padStart(2, '0'))
        .join('');
}
