import test from 'node:test';
import assert from 'assert';
import { Connection } from '@solana/web3.js';
import { loadConfig } from '../config/index.js';
import { ArbitrageEngine } from '../core/engine.js';
import { DexAdapter } from '../dex_adapters/baseAdapter.js';

class MockAdapter extends DexAdapter {
  constructor() { super('mock'); }
  async fetchPools() { return []; }
  async fetchPrices(p) { return p; }
}

test('engine initialize does not throw', async () => {
  const cfg = loadConfig();
  const engine = new ArbitrageEngine(cfg, new Connection(cfg.base.rpcUrl), [new MockAdapter()]);
  await engine.initialize();
  assert.ok(true);
});
