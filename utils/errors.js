export class ArbitrageError extends Error {
  /**
   * @param {string} message error message
   */
  constructor(message) {
    super(message);
    this.name = 'ArbitrageError';
  }
}

/** Error due to invalid configuration. */
export class ConfigError extends ArbitrageError {
  constructor(msg) {
    super(`Configuration error: ${msg}`);
    this.name = 'ConfigError';
  }
}

/** Generic data related error. */
export class DataError extends ArbitrageError {
  constructor(msg) {
    super(`Data error: ${msg}`);
    this.name = 'DataError';
  }
}

/** Error thrown when fetching pools from a DEX fails. */
export class PoolFetchError extends DataError {
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

/** Error thrown when building a swap transaction fails. */
export class TxBuildError extends ArbitrageError {
  /**
   * @param {string} dexName DEX adapter name
   * @param {Error} original original error
   */
  constructor(dexName, original) {
    super(`Failed to build transaction for ${dexName}: ${original.message}`);
    this.name = 'TxBuildError';
    this.original = original;
  }
}

/** Error thrown when calling an external API fails. */
export class ExternalApiError extends ArbitrageError {
  constructor(msg, original) {
    super(`External API error: ${msg}${original ? ` - ${original.message}` : ''}`);
    this.name = 'ExternalApiError';
    this.original = original;
  }
}

/** Error thrown when network/RPC request fails. */
export class NetworkError extends ArbitrageError {
  /**
   * @param {Error} original original error
   */
  constructor(original) {
    super(`Network error: ${original.message}`);
    this.name = 'NetworkError';
    this.original = original;
  }
}
