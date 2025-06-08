import test from 'node:test';
import assert from 'assert';
import { Heartbeat } from '../utils/healthcheck.js';
import * as telegram from '../notifier/telegram.js';

class MockConn {
  async getLatestBlockhash() { return {}; }
}

class FakeFetch {
  constructor() { this.called = false; }
  async fetch() { this.called = true; return { ok: true }; }
}

test('heartbeat logs alive', async () => {
  const hb = new Heartbeat(new MockConn(), '', 10, 1);
  let logged = false;
  hb.healthLogger = { info: () => { logged = true; }, error: () => {} };
  await hb.check();
  assert.ok(logged);
});

test('alert after failures', async () => {
  let sent = false;
  telegram.configureTelegram({ enabled: true, botToken: 't', chatId: 'c' });
  telegram.sendTelegram = async () => { sent = true; };
  const conn = { async getLatestBlockhash() { throw new Error('fail'); } };
  const hb = new Heartbeat(conn, '', 10, 2);
  hb.healthLogger = { info: () => {}, error: () => {} };
  await hb.check();
  await hb.check();
  assert.ok(sent);
});
