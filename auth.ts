import { existsUUID } from './basic.ts';
import { AuthEntry, db } from './deps.ts';

export function verifyToken(token: string): boolean {
    return !!db.query(
        `SELECT COUNT(*) FROM auth_entries WHERE 
        token = ? AND is_revoke = 0 AND (valid_before IS NULL OR valid_before >= ?)`,
        [token, Date.now()]
    )[0][0];
}

export function getNewToken(user_id: string, validBefore?: number) {
    if (!existsUUID(user_id)) return '';

    const token = crypto.randomUUID();

    db.query(
        `INSERT INTO auth_entries (user_id, token, valid_before, is_revoke) VALUES (?, ?, ?, 0)`,
        [user_id, token, validBefore]
    );

    return token;
}

export function getTokensOf(user_id: string) {
    if (!existsUUID(user_id)) return '';

    return db.queryEntries<AuthEntry>(
        `SELECT user_id, token, valid_before, is_revoke FROM auth_entries WHERE user_id = ?`,
        [user_id]
    );
}

export function revokeTokensOf(user_id: string) {
    db.query(`UPDATE auth_entries SET is_revoke = 1 WHERE user_id = ?`, [
        user_id,
    ]);
}

export function revokeToken(token: string) {
    db.query(`UPDATE auth_entries SET is_revoke = 1 WHERE token = ?`, [token]);
}

export function recoverToken(token: string) {
    db.query(`UPDATE auth_entries SET is_revoke = 0 WHERE token = ?`, [token]);
}

export function listTokens() {
    return db.queryEntries<AuthEntry>(
        `SELECT user_id, token, valid_before, is_revoke FROM auth_entries`
    );
}
