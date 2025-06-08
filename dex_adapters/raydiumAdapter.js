import { DexAdapter } from './baseAdapter.js';
import { RaydiumPoolKeyFinder } from '../src/pool_finder/raydium_finder.js';

/**
 * Raydium adapter using existing finder and fetcher logic.
 */
export class RaydiumAdapter extends DexAdapter {
  /**
   * Create new adapter instance.
   */
  constructor() {
    super('raydium');
    this.finder = new RaydiumPoolKeyFinder();
  }

  async fetchPools(mint) {
    try {
      return await this.finder.getPoolKey(mint);
    } catch (e) {
      return [];
    }
  }

  async fetchPrices(pools) {
    return pools.map(p => ({ ...p, price: 0 }));
  }

  /**
   * Placeholder transaction builder.
   * @param {Array} _pools
   */
  async buildTx(_pools, _prices) {
    // Implementation would create VersionedTransaction using fetched pools
  }
}
