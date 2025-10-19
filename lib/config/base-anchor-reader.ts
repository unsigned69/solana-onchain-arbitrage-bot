import fs from 'fs';
import path from 'path';

export interface TokenReference {
  symbol: string;
  address: string;
  decimals?: number;
}

export interface BaseAnchorPair {
  base: TokenReference;
  anchor: TokenReference;
}

export class BaseAnchorNotFoundError extends Error {
  constructor(message = 'Base/Anchor токены не найдены в конфиге') {
    super(message);
    this.name = 'BaseAnchorNotFoundError';
  }
}

const DEFAULT_CONFIG_RELATIVE_PATH = './config/token-picker.json';

/** Этот модуль вызывается и парсером, и экраном Конфига. Он НЕ зависит от runner. */
export function readBaseAnchor(configPath = resolveConfigPath()): BaseAnchorPair {
  const rawConfig = fs.readFileSync(configPath, 'utf8');
  const parsed = JSON.parse(rawConfig) as unknown;
  const pair = extractPair(parsed);
  if (!pair) {
    throw new BaseAnchorNotFoundError();
  }
  return pair;
}

function resolveConfigPath(): string {
  const configured = process.env.BOT_CONFIG_PATH;
  if (configured && configured.trim().length > 0) {
    return path.resolve(process.cwd(), configured);
  }
  return path.resolve(process.cwd(), DEFAULT_CONFIG_RELATIVE_PATH);
}

function extractPair(source: unknown): BaseAnchorPair | null {
  if (!source || typeof source !== 'object') {
    return null;
  }

  const record = source as Record<string, unknown>;
  const explicitTokens = record.tokens;

  if (explicitTokens && typeof explicitTokens === 'object') {
    const tokensRecord = explicitTokens as Record<string, unknown>;
    const base = normaliseToken(tokensRecord.base);
    const anchor = normaliseToken(tokensRecord.anchor);
    if (base && anchor) {
      return { base, anchor };
    }
  }

  const base = normaliseToken(record.base);
  const anchor = normaliseToken(record.anchor);
  if (base && anchor) {
    return { base, anchor };
  }

  return null;
}

function normaliseToken(input: unknown): TokenReference | null {
  if (!input || typeof input !== 'object') {
    return null;
  }
  const token = input as Record<string, unknown>;
  const address = typeof token.address === 'string' ? token.address : undefined;
  const symbol = typeof token.symbol === 'string' ? token.symbol : undefined;
  if (!address || !symbol) {
    return null;
  }
  const decimalsValue = token.decimals;
  const decimals = typeof decimalsValue === 'number' ? decimalsValue : undefined;
  return { symbol, address, decimals };
}
