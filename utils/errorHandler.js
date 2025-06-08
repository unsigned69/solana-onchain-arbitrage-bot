import { getLogger } from '../logger/index.js';
import { NetworkError } from './errors.js';
import fetch from 'node-fetch';

/**
 * Send alert to external channel if ALERT_WEBHOOK env variable is set.
 * @param {string} msg
 */
async function sendAlert(msg) {
  const hook = process.env.ALERT_WEBHOOK;
  if (!hook) return;
  try {
    await fetch(hook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: msg })
    });
  } catch (e) {
    // last resort logging
    getLogger().error(`Failed to send alert: ${e.message}`);
  }
}

/**
 * Handle network related errors with logging and optional recovery logic.
 * @param {Error} error
 */
export async function handleNetworkError(error, retries = 3, baseDelay = 500) {
  const logger = getLogger();
  const netErr = error instanceof NetworkError ? error : new NetworkError(error);
  for (let i = 0; i < retries; i++) {
    const delay = baseDelay * 2 ** i;
    logger.warn(`network issue, retry ${i + 1}/${retries} in ${delay}ms: ${netErr.message}`);
    await new Promise(r => setTimeout(r, delay));
  }
  logger.error(netErr);
}

/**
 * Handle unrecoverable error. Logs and sends alert.
 * @param {Error} error
 */
export async function handleFatalError(error) {
  const logger = getLogger();
  logger.error(`FATAL: ${error.stack || error.message}`);
  await sendAlert(`Fatal error: ${error.message}`);
}
