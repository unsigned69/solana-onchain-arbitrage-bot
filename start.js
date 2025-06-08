import { Connection } from '@solana/web3.js';
import { loadConfig } from './config/index.js';
import { ArbitrageEngine } from './core/engine.js';
import { RaydiumAdapter } from './dex_adapters/raydiumAdapter.js';
import { Heartbeat } from './utils/healthcheck.js';
import { configureTelegram, sendTelegram } from './notifier/telegram.js';

const config = loadConfig();
configureTelegram(config.telegram);

const connection = new Connection(config.base.rpcUrl);
const adapters = [new RaydiumAdapter()];
const heartbeat = new Heartbeat(connection, '', 10000, 3);
heartbeat.start();

const engine = new ArbitrageEngine(config, connection, adapters);

engine.run().catch(err => {
  sendTelegram('CRITICAL', 'ENGINE', err.message);
  console.error('Engine crashed', err);
});
