import { BaseAnchorPair } from '../config/base-anchor-reader';
import { CandidateFilters, CandidateToken, DexAdapter, FetchContext } from './dex-adapter';

function passesFilters(candidate: CandidateToken, filters?: CandidateFilters): boolean {
  if (!filters) {
    return true;
  }
  if (typeof filters.minLiquidity === 'number' && candidate.liquidity < filters.minLiquidity) {
    return false;
  }
  if (filters.symbolIncludes && !candidate.symbol.toLowerCase().includes(filters.symbolIncludes.toLowerCase())) {
    return false;
  }
  return true;
}

export class MockDexAdapter implements DexAdapter {
  public readonly name = 'mock-dex';

  async fetchCandidates(pair: BaseAnchorPair, filters: CandidateFilters | undefined, context: FetchContext): Promise<CandidateToken[]> {
    const nowIso = new Date().toISOString();
    const baseCandidate: CandidateToken = {
      symbol: `${pair.base.symbol}/${pair.anchor.symbol}`,
      address: pair.base.address,
      liquidity: 250000,
      source: `${this.name}:${context.endpoint}`,
      updatedAt: nowIso
    };
    const altCandidate: CandidateToken = {
      symbol: `${pair.anchor.symbol}/${pair.base.symbol}`,
      address: pair.anchor.address,
      liquidity: 175000,
      source: `${this.name}:${context.endpoint}`,
      updatedAt: nowIso
    };

    const candidates = [baseCandidate, altCandidate];
    return candidates.filter((candidate) => passesFilters(candidate, filters));
  }
}
