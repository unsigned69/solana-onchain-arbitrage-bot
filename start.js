import { Connection } from '@solana/web3.js';
import { loadConfig } from './config/index.js';
import { ArbitrageEngine } from './core/engine.js';
import { RaydiumAdapter } from './dex_adapters/raydiumAdapter.js';
import { Heartbeat } from './utils/healthcheck.js';
import { configureTelegram, sendTelegram } from './notifier/telegram.js';

function parseArgs() {
  const args = new Set(process.argv.slice(2));
  return {
    check: args.has('--check'),
    dryRun: args.has('--dry-run')
  };
}

function checkNodeVersion(requiredMajor = 18) {
  const current = process.versions.node;
  const major = parseInt(current.split('.')[0], 10);
  if (major < requiredMajor) {
    throw new Error(`Node.js ${requiredMajor}+ required, found ${current}`);
  }
}

async function checkConfig(cfg) {
  let ok = true;
  console.log('Checking environment...');
  console.log(`Node.js version: ${process.versions.node}`);
  try {
    checkNodeVersion();
  } catch (e) {
    console.error(`\u274c ${e.message}. Update Node.js from https://nodejs.org/`);
    ok = false;
  }

  if (!cfg.base.rpcUrl) {
    console.error('\u274c rpcUrl is missing in config.base');
    ok = false;
  }
  if (!cfg.base.screctKeyBase58 && (!Array.isArray(cfg.base.screctKey) || cfg.base.screctKey.length === 0)) {
    console.error('\u274c Provide screctKey or screctKeyBase58 in config.base');
    ok = false;
  }
  if (cfg.telegram?.enabled) {
    if (!cfg.telegram.botToken || !cfg.telegram.chatId) {
      console.error('\u26a0\ufe0f Telegram enabled but botToken or chatId missing');
      ok = false;
    }
  }

  try {
    const c = new Connection(cfg.base.rpcUrl);
    await c.getLatestBlockhash();
    console.log('\u2705 RPC connection ok');
  } catch (e) {
    console.error(`\u274c RPC connection failed: ${e.message}`);
    ok = false;
  }

  if (cfg.mintList.length === 0) {
    console.error('\u274c mintList is empty');
    ok = false;
  }

  return ok;
}

async function main() {
  const args = parseArgs();
  if (args.dryRun) {
    process.env.DRY_RUN = 'true';
  }

  let config;
  try {
    config = loadConfig();
  } catch (e) {
    console.error(`\u274c Failed to load config: ${e.message}`);
    console.error('Copy config/config.json.example to config/config.json and edit your settings.');
    process.exit(1);
  }

  configureTelegram(config.telegram);

  const ok = await checkConfig(config);
  if (args.check) {
    console.log(ok ? '\u2705 All checks passed!' : '\u274c Environment has problems.');
    process.exit(ok ? 0 : 1);
  }
  if (!ok) {
    console.error('Fix the above problems before running the bot.');
    process.exit(1);
  }

  if (config.dryRun) {
    console.log('🟢 Working in dry run mode, no real transactions will be sent.');
  }

  const connection = new Connection(config.base.rpcUrl);
  const adapters = [new RaydiumAdapter()];
  const heartbeat = new Heartbeat(connection, '', 10000, 3);
  heartbeat.start();

  const engine = new ArbitrageEngine(config, connection, adapters);

  engine.run().catch(err => {
    sendTelegram('CRITICAL', 'ENGINE', err.message);
    console.error('Engine crashed', err);
  });
}

main();
