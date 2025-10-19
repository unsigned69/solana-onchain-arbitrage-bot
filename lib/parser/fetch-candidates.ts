import { readBaseAnchor, BaseAnchorNotFoundError, BaseAnchorPair } from '../config/base-anchor-reader';
import { loadDexAdapters } from '../adapters';
import { CandidateFilters, CandidateToken, DexAdapter } from '../adapters/dex-adapter';
import { resolveParserRpcEndpoint } from '../adapters/rpc-endpoint';

export interface FetchCandidatesResult {
  pair: BaseAnchorPair;
  endpoint: string;
  candidates: CandidateToken[];
  adapterCount: number;
}

export async function fetchCandidates(filters?: CandidateFilters): Promise<FetchCandidatesResult> {
  const pair = readBaseAnchor();
  const endpoint = resolveParserRpcEndpoint();
  const adapters = loadDexAdapters();
  const aggregated: CandidateToken[] = [];

  for (const adapter of adapters) {
    const adapterCandidates = await safeFetch(adapter, pair, filters, endpoint);
    for (const candidate of adapterCandidates) {
      if (!aggregated.some((existing) => existing.address === candidate.address && existing.source === candidate.source)) {
        aggregated.push(candidate);
      }
    }
  }

  return {
    pair,
    endpoint,
    candidates: aggregated.sort((a, b) => b.liquidity - a.liquidity),
    adapterCount: adapters.length
  };
}

async function safeFetch(adapter: DexAdapter, pair: BaseAnchorPair, filters: CandidateFilters | undefined, endpoint: string): Promise<CandidateToken[]> {
  try {
    return await adapter.fetchCandidates(pair, filters, { endpoint });
  } catch (error) {
    console.error(`Failed to fetch candidates via ${adapter.name}:`, error);
    return [];
  }
}

export { CandidateFilters, CandidateToken, BaseAnchorNotFoundError };
