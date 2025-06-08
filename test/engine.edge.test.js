import test from 'node:test';
import assert from 'assert';
import { Connection } from '@solana/web3.js';
import { loadConfig } from '../config/index.js';
import { ArbitrageEngine } from '../core/engine.js';
import { DexAdapter } from '../dex_adapters/baseAdapter.js';
import { PoolFetchError } from '../utils/errors.js';

class EmptyAdapter extends DexAdapter {
  constructor() { super('empty'); this.called = false; }
  async fetchPools() { return []; }
  async createSwapTransaction() { this.called = true; }
}

class ErrorAdapter extends DexAdapter {
  constructor() { super('error'); }
  async fetchPools() { throw new Error('oops'); }
}

class NullAdapter {}

test('no pools skip tx', async () => {
  const cfg = loadConfig();
  cfg.dryRun = false;
  const adapter = new EmptyAdapter();
  const engine = new ArbitrageEngine(cfg, new Connection(cfg.base.rpcUrl), [adapter]);
  await engine.processMint('mint');
  assert.equal(adapter.called, false);
});

test('adapter error handled', async () => {
  const cfg = loadConfig();
  const adapter = new ErrorAdapter();
  const engine = new ArbitrageEngine(cfg, new Connection(cfg.base.rpcUrl), [adapter]);
  await engine.processMint('mint');
  assert.ok(true); // should not throw
});

test('skip invalid adapter', async () => {
  const cfg = loadConfig();
  const valid = new EmptyAdapter();
  const engine = new ArbitrageEngine(cfg, new Connection(cfg.base.rpcUrl), [valid, null]);
  await engine.processMint('mint');
  assert.equal(valid.called, false);
});

