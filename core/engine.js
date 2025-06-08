import { getLogger } from '../logger/index.js';
import { PoolFetchError } from '../utils/errors.js';

/**
 * Asynchronous arbitrage engine independent from concrete DEX.
 */
/**
 * Core orchestrator for arbitrage logic. The engine is stateless and can be
 * instantiated multiple times across workers.
 */
export class ArbitrageEngine {
  /**
   * @param {import('../config/index.js').Config} config validated config
   * @param {import('@solana/web3.js').Connection} connection Solana connection
   * @param {Array<import('../dex_adapters/baseAdapter.js').DexAdapter>} adapters adapters to use
   */
  constructor(config, connection, adapters) {
    this.config = config;
    this.connection = connection;
    this.adapters = adapters;
    this.logger = getLogger();
  }

  /**
   * Initialize all adapters.
   * @returns {Promise<void>}
   */
  async initialize() {
    for (const adapter of this.adapters) {
      await adapter.initialize(this.connection);
    }
    this.logger.info('Engine initialized');
  }

  /**
   * Execute a single arbitrage cycle for the given mint.
   * Public for testing purposes.
   * @param {string} mint token mint address
   * @returns {Promise<void>}
   */
  async processMint(mint) {
    for (const adapter of this.adapters) {
      try {
        const pools = await adapter.fetchPools(mint);
        this.logger.info(`${adapter.name} pools for ${mint}: ${pools?.length ?? 0}`);
        if (pools.length) {
          if (this.config.dryRun) {
            this.logger.info(`Dry run: skipping tx creation for ${adapter.name}`);
          } else {
            await adapter.createSwapTransaction(pools);
          }
        }
      } catch (e) {
        this.logger.error(new PoolFetchError(adapter.name, e).message);
      }
    }
  }

  /**
   * Start the continuous arbitrage loop.
   * @returns {Promise<void>}
   */
  async run() {
    await this.initialize();
    while (true) {
      try {
        for (const mint of this.config.mintList) {
          await this.processMint(mint);
        }
      } catch (e) {
        this.logger.error(`Engine error: ${e.message}`);
      }
      await new Promise(r => setTimeout(r, 1000));
    }
  }
}
