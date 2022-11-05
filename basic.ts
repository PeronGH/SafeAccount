import { db, sha256, User } from './deps.ts';

export async function createUser(name: string, password: string) {
    const uuid = crypto.randomUUID();
    try {
        const hash = await sha256(uuid + password);

        db.query(`INSERT INTO users (name, uuid, hash) VALUES (?, ?, ?)`, [
            name,
            uuid,
            hash,
        ]);
        return true;
    } catch {
        return false;
    }
}

export async function loginUser(name: string, password: string) {
    if (!existsUser(name)) return false;

    const [uuid, hash] = db.query<[string, string]>(
        `SELECT uuid, hash FROM users WHERE name = ?`,
        [name]
    )[0];

    return (await sha256(uuid + password)) === hash;
}

export function existsUser(name: string) {
    return !!db.query(`SELECT COUNT(*) FROM users WHERE name = ?`, [
        name,
    ])[0][0];
}

export async function changePwd(name: string, password: string) {
    if (!existsUser(name)) return false;

    const [uuid] = db.query<[string]>(`SELECT uuid FROM users WHERE name = ?`, [
        name,
    ])[0];

    const newHash = await sha256(uuid + password);

    db.query(`UPDATE users SET hash = ? WHERE name = ?`, [newHash, name]);

    return true;
}

export function changeName(oldName: string, newName: string) {
    if (!existsUser(oldName)) return false;

    db.query(`UPDATE users SET name = ? WHERE name = ?`, [newName, oldName]);

    return true;
}

export function removeUser(name: string) {
    if (!existsUser(name)) return false;

    db.query(`DELETE FROM users WHERE name = ?`, [name]);

    return true;
}

export function listUsers() {
    return db.queryEntries<User>(`SELECT * FROM users`);
}

export function queryUUID(name: string) {
    const [uuid] = db.query<[string]>(`SELECT uuid FROM users WHERE name = ?`, [
        name,
    ]);

    if (uuid) return uuid[0];
    return '';
}

export function existsUUID(uuid: string) {
    return !!db.query(`SELECT COUNT(*) FROM users WHERE uuid = ?`, [
        uuid,
    ])[0][0];
}
