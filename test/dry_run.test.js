import test from 'node:test';
import assert from 'assert';
import { Connection } from '@solana/web3.js';
import { loadConfig } from '../config/index.js';
import { ArbitrageEngine } from '../core/engine.js';
import { DexAdapter } from '../dex_adapters/baseAdapter.js';

class MockAdapter extends DexAdapter {
  constructor() { super('mock'); this.called = false; }
  async fetchPools() { return [1]; }
  async createSwapTransaction() { this.called = true; }
}

test('dry run skips transaction creation', async () => {
  const cfg = loadConfig();
  cfg.dryRun = true;
  const adapter = new MockAdapter();
  const engine = new ArbitrageEngine(cfg, new Connection(cfg.base.rpcUrl), [adapter]);
  await engine.processMint('mint');
  assert.equal(adapter.called, false);
});
