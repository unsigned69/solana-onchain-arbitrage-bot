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
   * Create swap transactions from a list of pools.
   * @param {Array} pools fetched pool objects
   * @returns {Promise<void>}
   */
  async createSwapTransaction(pools) {
    throw new Error('Not implemented');
  }
}
