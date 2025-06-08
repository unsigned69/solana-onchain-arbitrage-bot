import { getLogger } from '../logger/index.js';

export class Heartbeat {
  /**
   * @param {import('@solana/web3.js').Connection} connection
   * @param {string} dexUrl URL for a DEX API endpoint
   * @param {number} interval interval in ms
   */
  constructor(connection, dexUrl, interval = 5000) {
    this.connection = connection;
    this.dexUrl = dexUrl;
    this.interval = interval;
    this.logger = getLogger();
    this.timer = null;
  }

  async check() {
    try {
      await this.connection.getLatestBlockhash();
      if (this.dexUrl) {
        await fetch(this.dexUrl, { method: 'HEAD' });
      }
      this.logger.info('heartbeat ok');
    } catch (e) {
      this.logger.error(`heartbeat failed: ${e.message}`);
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
