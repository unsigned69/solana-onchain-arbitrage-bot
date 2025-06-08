import test from 'node:test';
import assert from 'assert';
import nock from 'nock';
import { configureTelegram, sendTelegram, _clearThrottle } from '../notifier/telegram.js';

const api = 'https://api.telegram.org';

function mockSend(expected) {
  let count = 0;
  nock(api).post(/.*/).reply(200, () => { count++; return {}; }).persist();
  return () => {
    nock.cleanAll();
    assert.equal(count, expected);
  };
}

test.afterEach(() => _clearThrottle());

test('no send when disabled', async () => {
  const check = mockSend(0);
  configureTelegram({ enabled: false, botToken: 't', chatId: 'c' });
  await sendTelegram('ERROR', 'TEST', 'msg');
  check();
});

test('send each level', async () => {
  const levels = ['CRITICAL','ALERT','ERROR','WARNING','PROFIT','INFO'];
  const check = mockSend(levels.length);
  configureTelegram({ enabled: true, botToken: 't', chatId: 'c', profitNotify: true });
  for (const lvl of levels) {
    await sendTelegram(lvl, 'TEST', 'msg');
  }
  check();
});

test('respect profit/info flags', async () => {
  const check = mockSend(1);
  configureTelegram({ enabled: true, botToken: 't', chatId: 'c', profitNotify: false, infoNotify: false });
  await sendTelegram('PROFIT', 'TEST', 'msg');
  await sendTelegram('INFO', 'TEST', 'msg');
  await sendTelegram('ERROR', 'TEST', 'msg');
  check();
});

test('throttling by level', async () => {
  const check = mockSend(1);
  configureTelegram({ enabled: true, botToken: 't', chatId: 'c' });
  await sendTelegram('ERROR', 'A', 'one');
  await sendTelegram('ERROR', 'B', 'two');
  check();
});
