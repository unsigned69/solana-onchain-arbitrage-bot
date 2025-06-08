import { getLogger } from '../logger/index.js';
import { NetworkError } from './errors.js';

/**
 * Handle network related errors with logging and optional recovery logic.
 * @param {Error} error
 */
export function handleNetworkError(error) {
  const logger = getLogger();
  const netErr = error instanceof NetworkError ? error : new NetworkError(error);
  logger.error(netErr);
}
