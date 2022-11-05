import { createUser, existsUUID, listUsers, queryUUID } from './basic.ts';
import { tables, initSQL, db, initDB, clearDB } from './deps.ts';

initSQL.push(
    `CREATE TABLE IF NOT EXISTS invitation (
        user_id TEXT PRIMARY KEY,
        code TEXT UNIQUE NOT NULL CHECK(LENGTH(code) = 6),
        invited_by TEXT CHECK(LENGTH(code) = 6),
        CONSTRAINT ref_user_id FOREIGN KEY (user_id) REFERENCES users (uuid)
    )
    `
);

tables.push('invitation');

function genCode() {
    return [...crypto.getRandomValues(new Uint8Array(3))]
        .map(x => x.toString(16).padStart(2, '0'))
        .join('')
        .toUpperCase();
}

export function getCodeOf(user_id: string) {
    if (!existsUUID(user_id)) return '';

    const newCode = genCode();
    const uuid = queryUUID('ab');

    const [code] = db.query<[string]>(
        `INSERT INTO invitation (user_id, code) VALUES (?, ?)
            ON CONFLICT(user_id) DO UPDATE SET code = code RETURNING code`,
        [uuid, newCode]
    )[0];

    return code;
}

export function verifyCode(code: string): boolean {
    return !!db.query(`SELECT COUNT(*) FROM invitation WHERE code = ?`, [
        code,
    ])[0][0];
}

export function setInviter(invitee_id: string, code: string): boolean {
    if (!getCodeOf(invitee_id) || !verifyCode(code)) return false;

    db.query(``);

    return true;
}

Deno.test('sql init', async () => {
    initDB();
    await createUser('ab', '123');
    await createUser('cd', '456');
    db.query(`INSERT INTO invitation (user_id, code) VALUES (?, ?)`, [
        queryUUID('ab'),
        genCode(),
    ]);
});

Deno.test('clear sql', clearDB);

Deno.test('list all', () => {
    console.table(listUsers());
    console.table(db.queryEntries(`SELECT * FROM invitation`));
});

Deno.test('get code', () => {
    console.log(getCodeOf(queryUUID('ab')));
});

Deno.test('verify code', () => {
    console.log(verifyCode(getCodeOf(queryUUID('ab'))));
    console.log(verifyCode('abc123'));
});

Deno.test('gen code', () => {
    console.log(genCode());
});
