import { Connection } from '@solana/web3.js';
import { loadConfig } from './config/index.js';
import { ArbitrageEngine } from './core/engine.js';
import { RaydiumAdapter } from './dex_adapters/raydiumAdapter.js';

const config = loadConfig();
const connection = new Connection(config.base.rpcUrl);
const adapters = [new RaydiumAdapter()];

const engine = new ArbitrageEngine(config, connection, adapters);

engine.run().catch(err => {
  console.error('Engine crashed', err);
});
