import {
    getNewToken,
    getTokensOf,
    listTokens,
    recoverToken,
    revokeToken,
    verifyToken,
} from './auth.ts';
import {
    changePwd,
    createUser,
    existsUser,
    loginUser,
    changeName,
    removeUser,
    listUsers,
    queryUUID,
} from './basic.ts';
import { clearDB, initDB, tables } from './deps.ts';

Deno.test('init db', () => {
    initDB();
});

Deno.test('create user', async () => {
    console.log(await createUser('ab', '123'));
    console.log(await createUser('cd', '456'));
});

Deno.test('exits user', () => {
    console.log(existsUser('ab'));
    console.log(existsUser('cd'));
});

Deno.test('login user', async () => {
    console.log(await loginUser('ab', '123'));
    console.log(await loginUser('ab', '456'));
    console.log(await loginUser('cd', '123'));
});

Deno.test('change password', async () => {
    console.log(await changePwd('ab', '456'));
    console.log(await changePwd('cd', '123'));
});

Deno.test('change username', () => {
    changeName('ab', 'cd');
});

Deno.test('remove user', () => {
    removeUser('cd');
});

Deno.test('list users', () => {
    console.table(listUsers());
});

Deno.test('clear DB', () => {
    console.log(tables);
    clearDB();
    loginUser('ab', '123').catch(() => console.log('db already cleared'));
});

Deno.test('query uuid', () => {
    console.log(queryUUID('ab'));
    console.log(queryUUID('abc'));
    console.log(queryUUID('cd'));
});

Deno.test('get new token', () => {
    console.log(getNewToken(queryUUID('ab')));
    console.log(getNewToken(queryUUID('ab'), Date.now()));
    console.log(getNewToken(queryUUID('ab'), Date.now() * 2));
});

Deno.test('list tokens', () => {
    console.table(listTokens());
});

Deno.test('revoke token', () => {
    revokeToken(listTokens()[0].token);
    recoverToken(listTokens()[1].token);
});

Deno.test('get all tokens', () => {
    console.table(getTokensOf(queryUUID('ab')));
});

Deno.test('verify token', () => {
    console.log(verifyToken(listTokens()[0].token));
    console.log(verifyToken(listTokens()[1].token));
    console.log(verifyToken(listTokens()[2].token));
});
