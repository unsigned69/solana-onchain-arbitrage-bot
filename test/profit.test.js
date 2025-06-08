import test from 'node:test';
import assert from 'assert';
import { Connection } from '@solana/web3.js';
import { loadConfig } from '../config/index.js';
import { ArbitrageEngine } from '../core/engine.js';
import { DexAdapter } from '../dex_adapters/baseAdapter.js';

class ProfitAdapter extends DexAdapter {
  constructor(pools) { super('profit'); this.pools = pools; }
  async fetchPools() { return this.pools; }
  async createSwapTransaction() {}
}

test('simulate profitable trade', async () => {
  const cfg = loadConfig();
  cfg.dryRun = true;
  const adapter = new ProfitAdapter([{ profit: 1 }, { profit: 1 }]);
  const engine = new ArbitrageEngine(cfg, new Connection(cfg.base.rpcUrl), [adapter]);
  const [res] = await engine.processMint('mint');
  assert.equal(res.fee, 0.2);
  assert.equal(res.profit, 1.8);
});

test('simulate losing trade', async () => {
  const cfg = loadConfig();
  cfg.dryRun = true;
  const adapter = new ProfitAdapter([{ profit: 0 }, { profit: 0 }]);
  const engine = new ArbitrageEngine(cfg, new Connection(cfg.base.rpcUrl), [adapter]);
  const [res] = await engine.processMint('mint');
  assert.equal(res.fee, 0.2);
  assert.equal(res.profit, -0.2);
});
