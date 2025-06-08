import test from 'node:test';
import assert from 'assert';
import nock from 'nock';
import { configureTelegram, sendTelegram } from '../notifier/telegram.js';

const api = 'https://api.telegram.org';

test('no send when disabled', async () => {
  configureTelegram({ enabled: false, botToken: 't', chatId: 'c' });
  let called = false;
  nock(api).post(/.*/).reply(200, () => { called = true; return {}; });
  await sendTelegram('ERROR', 'TEST', 'msg');
  assert.equal(called, false);
});

test('send when enabled', async () => {
  configureTelegram({ enabled: true, botToken: 't', chatId: 'c' });
  let called = false;
  nock(api).post(/.*/).reply(200, () => { called = true; return {}; });
  await sendTelegram('ALERT', 'TEST', 'msg');
  assert.ok(called);
});
