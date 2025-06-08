import test from 'node:test';
import assert from 'assert';
import { Connection } from '@solana/web3.js';
import { loadConfig } from '../config/index.js';
import { ArbitrageEngine } from '../core/engine.js';
import { DexAdapter } from '../dex_adapters/baseAdapter.js';
import { NetworkError } from '../utils/errors.js';

class RpcFailAdapter extends DexAdapter {
  constructor() { super('rpcfail'); }
  async fetchPools() { throw new NetworkError(new Error('rpc down')); }
}

class InvalidPoolAdapter extends DexAdapter {
  constructor() { super('invalid'); }
  async fetchPools() { return [{}]; }
  async fetchPrices(p) { return p; }
  async buildTx() { throw new Error('invalid pool'); }
}

class DexFailAdapter extends DexAdapter {
  constructor() { super('dexfail'); }
  async fetchPools() { return [1]; }
  async fetchPrices(p) { return p; }
  async buildTx() { throw new NetworkError(new Error('dex down')); }
}

test('handles rpc failure', async () => {
  const cfg = loadConfig();
  const engine = new ArbitrageEngine(cfg, new Connection(cfg.base.rpcUrl), [new RpcFailAdapter()]);
  await engine.processMint('mint');
  assert.ok(true);
});

test('handles invalid pool', async () => {
  const cfg = loadConfig();
  const engine = new ArbitrageEngine(cfg, new Connection(cfg.base.rpcUrl), [new InvalidPoolAdapter()]);
  await engine.processMint('mint');
  assert.ok(true);
});

test('handles dex failure mid swap', async () => {
  const cfg = loadConfig();
  const engine = new ArbitrageEngine(cfg, new Connection(cfg.base.rpcUrl), [new DexFailAdapter()]);
  await engine.processMint('mint');
  assert.ok(true);
});
