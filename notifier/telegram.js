import fetch from 'node-fetch';
import { getLogger } from '../logger/index.js';

/** Telegram configuration loaded from config */
let telegramCfg = { enabled: false };
/** Timestamp of last message per level to throttle spam */
const lastSent = new Map();
const THROTTLE_MS = 60_000;

/**
 * Configure telegram settings
 * @param {import('../config/index.js').Config['telegram']} cfg
 */
export function configureTelegram(cfg = {}) {
  telegramCfg = {
    enabled: false,
    profitNotify: false,
    infoNotify: true,
    botToken: '',
    chatId: '',
    ...cfg
  };
  if (process.env.TELEGRAM_TOKEN) {
    telegramCfg.botToken = process.env.TELEGRAM_TOKEN;
  }
  if (process.env.TELEGRAM_CHAT_ID) {
    telegramCfg.chatId = process.env.TELEGRAM_CHAT_ID;
  }
}

/**
 * Send structured Telegram message if enabled.
 * @param {'CRITICAL'|'ALERT'|'ERROR'|'WARNING'|'PROFIT'|'INFO'} level
 * @param {string} type short type label
 * @param {string} message main message
 * @param {any} [extra] optional extra object
 */
export async function sendTelegram(level, type, message, extra) {
  if (!telegramCfg.enabled) return;
  if (level === 'PROFIT' && !telegramCfg.profitNotify) return;
  if (level === 'INFO' && !telegramCfg.infoNotify) return;
  const now = Date.now();
  if (lastSent.has(level) && now - lastSent.get(level) < THROTTLE_MS) {
    return;
  }
  lastSent.set(level, now);
  try {
    const emojis = {
      CRITICAL: '❗️',
      ALERT: '🚨',
      ERROR: '⚠️',
      WARNING: '❕',
      PROFIT: '💰',
      INFO: 'ℹ️'
    };
    const text = `${emojis[level] || ''} [${level}] ${type}\n${message}` +
      (extra ? `\n${JSON.stringify(extra)}` : '') +
      `\n${new Date().toISOString()}`;
    const url = `https://api.telegram.org/bot${telegramCfg.botToken}/sendMessage`;
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: telegramCfg.chatId, text })
    });
  } catch (e) {
    getLogger().error(`Telegram send failed: ${e.message}`);
  }
}

/** Clear throttle map for tests */
export function _clearThrottle() {
  lastSent.clear();
}
