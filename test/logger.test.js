import test from 'node:test';
import assert from 'assert';
import winston from 'winston';
import { Writable } from 'stream';
import { getLogger } from '../logger/index.js';

test('logger records info and error', () => {
  const messages = [];
  const memory = new Writable({
    write(chunk, _enc, cb) { messages.push(chunk.toString().trim()); cb(); }
  });
  const memoryTransport = new winston.transports.Stream({ stream: memory });

  const logger = getLogger({ forceNew: true, transports: [memoryTransport] });
  logger.info('hello');
  logger.error('boom');

  assert.ok(messages.some(m => m.includes('hello')));
  assert.ok(messages.some(m => m.includes('boom')));
});
