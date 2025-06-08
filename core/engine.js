import { getLogger } from '../logger/index.js';
import { PoolFetchError, TxBuildError, NetworkError } from '../utils/errors.js';
import { handleNetworkError } from '../utils/errorHandler.js';
import { sendTelegram } from '../notifier/telegram.js';

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
      if (!adapter) continue;
      await adapter.initialize(this.connection);
    }
    this.logger.info('Engine initialized');
  }

  /**
   * Simulate arbitrage transaction for dry run mode.
   * @param {string} adapterName
   * @param {Array} pools
   */
  simulateTransaction(adapterName, pools) {
    const fee = pools.length * 0.1;
    const gross = pools.reduce((a, p) => a + (p.profit || 0), 0);
    const profit = gross - fee;
    this.logger.dryRun(
      `${adapterName} simulate -> pools:${pools.length} profit:${profit.toFixed(2)} fee:${fee.toFixed(2)}`
    );
    if (this.config.telegram?.profitNotify) {
      sendTelegram('PROFIT', 'SIMULATE', `${adapterName} profit ${profit.toFixed(2)}`);
    }
    return { profit, fee };
  }

  /**
   * Execute a single arbitrage cycle for the given mint.
   * Public for testing purposes.
   * @param {string} mint token mint address
   * @returns {Promise<void>}
   */
  async processMint(mint) {
    const results = [];
    for (const adapter of this.adapters) {
      if (!adapter) continue;
      try {
        const pools = await adapter.fetchPools(mint);
        this.logger.info(`${adapter.name} pools for ${mint}: ${pools?.length ?? 0}`);
        if (pools.length) {
          const prices = await adapter.fetchPrices(pools);
          if (this.config.dryRun) {
            results.push(this.simulateTransaction(adapter.name, prices));
          } else {
            try {
              await adapter.buildTx(pools, prices);
            } catch (err) {
              throw new TxBuildError(adapter.name, err);
            }
          }
        }
      } catch (e) {
        if (e instanceof NetworkError) {
          await handleNetworkError(e);
        } else {
          this.logger.error(new PoolFetchError(adapter.name, e).message);
        }
      }
    }
    return results;
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
