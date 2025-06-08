/**
 * Base class for DEX adapters.
 */
export class DexAdapter {
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
   * Create swap transactions (placeholder).
   * @returns {Promise<void>}
   */
  async createSwapTransaction() {
    throw new Error('Not implemented');
  }
}
