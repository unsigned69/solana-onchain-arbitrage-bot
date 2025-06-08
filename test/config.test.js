import { strict as assert } from 'assert';
import test from 'node:test';
import { loadConfig } from '../config/index.js';

test('loadConfig returns object', () => {
  const cfg = loadConfig();
  assert.ok(cfg.base.rpcUrl);
});
