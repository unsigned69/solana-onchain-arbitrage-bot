export class ArbitrageError extends Error {
  /**
   * @param {string} message error message
   */
  constructor(message) {
    super(message);
    this.name = 'ArbitrageError';
  }
}

/** Error thrown when fetching pools from a DEX fails. */
export class PoolFetchError extends ArbitrageError {
  /**
   * @param {string} dexName DEX adapter name
   * @param {Error} original original error
   */
  constructor(dexName, original) {
    super(`Failed to fetch pools from ${dexName}: ${original.message}`);
    this.name = 'PoolFetchError';
    this.original = original;
  }
}
