import { getLogger } from '../logger/index.js';

/**
 * Asynchronous arbitrage engine independent from concrete DEX.
 */
export class ArbitrageEngine {
  constructor(config, connection, adapters) {
    this.config = config;
    this.connection = connection;
    this.adapters = adapters;
    this.logger = getLogger();
  }

  async initialize() {
    for (const adapter of this.adapters) {
      await adapter.initialize(this.connection);
    }
    this.logger.info('Engine initialized');
  }

  async run() {
    await this.initialize();
    while (true) {
      try {
        for (const mint of this.config.mintList) {
          for (const adapter of this.adapters) {
            const pools = await adapter.fetchPools(mint);
            this.logger.info(`${adapter.name} pools for ${mint}: ${pools?.length ?? 0}`);
            // profit calculation & tx creation would happen here
          }
        }
      } catch (e) {
        this.logger.error(`Engine error: ${e.message}`);
      }
      await new Promise(r => setTimeout(r, 1000));
    }
  }
}
