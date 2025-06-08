import test from 'node:test';
import assert from 'assert';
import { PoolFetchError, TxBuildError, NetworkError } from '../utils/errors.js';

// purposely throw and catch each custom error

test('PoolFetchError instance', () => {
  const err = new PoolFetchError('dex', new Error('fail'));
  assert.equal(err.name, 'PoolFetchError');
  assert.ok(err.message.includes('dex'));
});

test('TxBuildError instance', () => {
  const err = new TxBuildError('dex', new Error('boom'));
  assert.equal(err.name, 'TxBuildError');
  assert.ok(err.message.includes('boom'));
});

test('NetworkError instance', () => {
  const err = new NetworkError(new Error('net'));
  assert.equal(err.name, 'NetworkError');
  assert.ok(err.message.includes('net'));
});
