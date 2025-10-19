import { BaseAnchorPair } from '../config/base-anchor-reader';

export interface CandidateFilters {
  minLiquidity?: number;
  symbolIncludes?: string;
}

export interface CandidateToken {
  symbol: string;
  address: string;
  liquidity: number;
  source: string;
  updatedAt: string;
}

export interface FetchContext {
  endpoint: string;
}

export interface DexAdapter {
  name: string;
  fetchCandidates(pair: BaseAnchorPair, filters: CandidateFilters | undefined, context: FetchContext): Promise<CandidateToken[]>;
}
