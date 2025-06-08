# Solana Onchain Arbitrage Bot

This project provides a modular arbitrage bot written in JavaScript. The goal is to offer an extensible foundation for experimenting with on–chain arbitrage across multiple Solana DEXes.

## Project layout

- **core/** – asynchronous arbitrage engine that orchestrates the workflow
- **dex_adapters/** – DEX specific adapters which implement a common interface
- **contracts/** – interaction helpers for Anchor/IDL programs
- **config/** – configuration and schema validation
- **logger/** – centralized logger with file rotation
- **utils/** – shared utility functions
- **test/** – unit tests

## Quick start

1. Install dependencies
   ```bash
   cd src && npm install
   ```
2. Edit `config/config.json` and provide your RPC endpoint and keypair.
3. Run the bot
   ```bash
   node ../start.js
   ```
   By default the bot runs in **dryRun** mode and does not send transactions.

## Adding a new DEX adapter

Adapters should extend `DexAdapter` and implement at least `initialize` and `fetchPools` methods. Place the adapter in `dex_adapters/` and pass an instance to `ArbitrageEngine`.

```js
import { DexAdapter } from './baseAdapter.js';
export class MyDexAdapter extends DexAdapter {
  constructor() { super('mydex'); }
  async fetchPools(mint) { /* ... */ }
}
```

## Logging

Logs are written to `logs/` with daily rotation. Levels (info, warn, error) can be configured by adjusting the logger.

## Tests

Run unit tests with
```bash
npm test
```

This repository is a starting point and does **not** provide financial advice. Use at your own risk.
