import test from 'node:test';
import assert from 'assert';
import { Heartbeat } from '../utils/healthcheck.js';

class MockConn {
  async getLatestBlockhash() { return {}; }
}

class FakeFetch {
  constructor() { this.called = false; }
  async fetch() { this.called = true; return { ok: true }; }
}

test('heartbeat logs alive', async () => {
  const hb = new Heartbeat(new MockConn(), '', 10);
  let logged = false;
  hb.logger = { info: () => { logged = true; }, error: () => {} };
  await hb.check();
  assert.ok(logged);
});
