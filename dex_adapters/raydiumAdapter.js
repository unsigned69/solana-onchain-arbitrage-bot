import { DexAdapter } from './baseAdapter.js';
import { RaydiumPoolKeyFinder } from '../src/pool_finder/raydium_finder.js';

/**
 * Raydium adapter using existing finder and fetcher logic.
 */
export class RaydiumAdapter extends DexAdapter {
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
}
