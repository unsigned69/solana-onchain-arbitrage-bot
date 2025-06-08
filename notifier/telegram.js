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
  telegramCfg = { enabled: false, profitNotify: false, ...cfg };
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
  const now = Date.now();
  const key = `${level}:${type}`;
  if (lastSent.has(key) && now - lastSent.get(key) < THROTTLE_MS) {
    return;
  }
  lastSent.set(key, now);
  try {
    const text = `[${level}] ${type} - ${message}` + (extra ? `\n\n${JSON.stringify(extra)}` : '');
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
