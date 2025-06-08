import { getLogger } from '../logger/index.js';
import winston from 'winston';
import 'winston-daily-rotate-file';
import { sendTelegram } from '../notifier/telegram.js';

export class Heartbeat {
  /**
   * @param {import('@solana/web3.js').Connection} connection
   * @param {string} dexUrl URL for a DEX API endpoint
   * @param {number} interval interval in ms
   */
  constructor(connection, dexUrl, interval = 5000, alertThreshold = 3) {
    this.connection = connection;
    this.dexUrl = dexUrl;
    this.interval = interval;
    this.logger = getLogger();
    this.healthLogger = winston.createLogger({
      transports: [
        new winston.transports.DailyRotateFile({
          filename: 'logs/health-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          maxFiles: '7d'
        })
      ]
    });
    this.failureCount = 0;
    this.alertThreshold = alertThreshold;
    this.timer = null;
  }

  async check() {
    try {
      await this.connection.getLatestBlockhash();
      if (this.dexUrl) {
        await fetch(this.dexUrl, { method: 'HEAD' });
      }
      this.healthLogger.info('ok');
      if (this.failureCount > 0) {
        sendTelegram('INFO', 'HEARTBEAT', 'recovered after failure');
      }
      this.failureCount = 0;
    } catch (e) {
      this.failureCount++;
      this.healthLogger.error(`fail ${this.failureCount}: ${e.message}`);
      if (this.failureCount >= this.alertThreshold) {
        sendTelegram('ALERT', 'HEARTBEAT', `failed ${this.failureCount} times`, { error: e.message });
      }
    }
  }

  start() {
    if (this.timer) return;
    this.logger.info('heartbeat started');
    this.timer = setInterval(() => this.check(), this.interval);
  }

  stop() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }
}
