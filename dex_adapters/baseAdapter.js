/**
 * Base class for DEX adapters.
 */
export class DexAdapter {
  /**
   * @param {string} name human readable adapter name
   */
  constructor(name) {
    this.name = name;
  }

  /**
   * Initialize adapter.
   * @param {import('@solana/web3.js').Connection} connection
   */
  async initialize(connection) {
    this.connection = connection;
  }

  /**
   * Fetch pools for mint.
   * @param {string} mint
   * @returns {Promise<Array>}
   */
  async fetchPools(mint) {
    return [];
  }

  /**
   * Fetch price info for pools.
   * @param {Array} pools
   * @returns {Promise<Array>}
   */
  async fetchPrices(pools) {
    return pools;
  }

  /**
   * Build swap transaction from pools and prices.
   * @param {Array} pools fetched pool objects
   * @param {Array} prices price info
   * @returns {Promise<void>}
   */
  async buildTx(pools, prices) {
    throw new Error('Not implemented');
  }
}
