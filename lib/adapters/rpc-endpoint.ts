export function resolveParserRpcEndpoint(): string {
  const envEndpoint = process.env.PARSER_RPC_ENDPOINT;
  if (envEndpoint && envEndpoint.trim().length > 0) {
    return envEndpoint;
  }
  const fallback = process.env.RPC_ENDPOINT;
  if (fallback && fallback.trim().length > 0) {
    return fallback;
  }
  return 'http://127.0.0.1:8899';
}
