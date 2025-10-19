# Pay attention! This bot was refactored via CODEX from OpeanAI. At the moment this is an experiment. All changes, improvements, and enhancements will be carried out by AI.


# 🌟 Star Break 388 Open Source Arbitrage Contract


# Solana On-Chain Arbitrage Bot


## 📜 Code Analysis
[![Ask DeepWiki](https://deepwiki.com/badge.svg)]([https://deepwiki.com/touyi/solana-onchain-arbitrage-bot](https://deepwiki.com/unsigned69/solana-onchain-arbitrage-bot))

Supports intelligent routing and calculates optimal arbitrage routes. This is a Solana on-chain arbitrage bot that supports intelligent routing and calculates optimal arbitrage routes.

## 📝 Basic Introduction

This repository contains an arbitrage bot based on contract intelligent routing, which is divided into a client and a contract. This repository represents the client, with the following main functions:

- Retrieve trading pools for arbitrage.
- Automatically pair trading pools and assemble and submit trades.

Regarding the contract (contract address: DxeQQ7PQ94j26ism5ivTqNHAkteFNmgRpqYx7XQFqs9Z):

- Receive trading pools submitted by the client.
- Automatically calculate the optimal arbitrage path and the optimal input (if any), and initiate the arbitrage operation. Otherwise, the transaction will fail.

The currently supported trading pools will be continuously expanded in the future:

- PumpSwap
- Raydium AMM
- Raydium CPMM
- Raydium CLMM
- Meteora DLMM
- Meteora Dynamic Pools

> **For successful arbitrage trades using this arbitrage bot, a 10% fee of the profit will be charged. If the arbitrage fails or there is no profit, the contract will not charge any fees.** For example, if you input 0.5 SOL and output 0.6 SOL, the profit is 0.1 SOL, and the fee is 0.1 * 10% = 0.01 SOL.

## 🔧 Architecture Overview

The repository is organised into several top level folders:

- `core/` – stateless arbitrage engine orchestrating the flow
- `dex_adapters/` – one module per DEX implementing a common interface
- `contracts/` – on-chain program interaction code
- `config/` – configuration files and validation helpers
- `logger/` – centralised logging with daily rotation
- `utils/` – pure utility helpers
- `test/` – unit tests

### Adding a new DEX adapter

1. Create a class extending `DexAdapter` in `dex_adapters/`.
2. Implement at least `initialize(connection)` and `fetchPools(mint)`.
3. Optionally provide `createSwapTransaction(pools)` for transaction generation.
4. Instantiate your adapter in `start.js`.

## 🚀 Quick Start

### 1. Install Node.js

Download and install the LTS version of Node.js (18 or higher) from [nodejs.org](https://nodejs.org/).

### 2. Get the code

Clone the repository or download the ZIP archive and unpack it.

### 3. Install dependencies

```bash
npm install
```

### 4. Create your config

```bash
cp config/config.json.example config/config.json
```

Edit `config/config.json` and set your RPC URL, wallet key and optional Telegram token and chat ID.

### 5. Check your setup

```bash
node start.js --check
```

If you see `✅ All checks passed!` you are ready to continue.

### 6. First run in dry mode

```bash
node start.js --dry-run
```

No real transactions will be sent. Once everything works, run `node start.js` without `--dry-run`.

### Convert SOL to Wrapped SOL (WSOL)

DEXs generally use WSOL for trading. Therefore, you need to convert an equivalent amount of SOL to WSOL in your account before starting the trading. Use the script provided in the repository to perform the conversion:

Execute the following command in the `src/tools` directory: `node warp_sol.js --amount=1000000000`

Here, `amount` is the amount of SOL in lamports.

To convert WSOL back to SOL, execute `node warp_sol.js --amount=1000000000 --close`

> Ensure that the converted amount is greater than the `maxInputAmount` field configured in `config.js`. The default configuration of `1000000000` represents 1 WSOL.

### Start the Bot

Execute the following command in the `src` directory:

```bash
node main.js
```

After starting, you will see the following log output:

```javascript
🚀 ~ swap::e: SendTransactionError: Simulation failed. 
Catch the `SendTransactionError` and call `getLogs()` on it for full details.
    at Connection.sendEncodedTransaction (/home/touyi/sol/solana-onchain-arbitrage-bot/src/node_modules/@solana/web3.js/lib/index.cjs.js:8206:13)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async Connection.sendRawTransaction (/home/touyi/sol/solana-onchain-arbitrage-bot/src/node_modules/@solana/web3.js/lib/index.cjs.js:8171:20)
    at async file:///home/touyi/sol/solana-onchain-arbitrage-bot/src/bot/arb_bot.js:237:43 {
  signature: '',
  transactionMessage: 'Transaction simulation failed: Error processing Instruction 2: custom program error: 0x1772',
  transactionLogs: [
    'Program ComputeBudget111111111111111111111111111111 invoke [1]',
    'Program ComputeBudget111111111111111111111111111111 success',
    'Program ComputeBudget111111111111111111111111111111 invoke [1]',
    'Program ComputeBudget111111111111111111111111111111 success',
    'Program 3SmBMUQe5QUpLc7wMrm97CRs3kXBSFtMZvPw8CDwZvUi invoke [1]',
    'Program log: Instruction: ArbProcess32Account',
    'Program DxeQQ7PQ94j26ism5ivTqNHAkteFNmgRpqYx7XQFqs9Z invoke [2]',
    'Program log: Instruction: ArbProcess32Account',
    'Program log: max_in 1000000000, min_profit 100， market_type [0, 0], market_flag [0, 0]',
    'Program log: sol_log_compute_units programs/arb_touyi/src/processor.rs:550',
    'Program consumption: 257040 units remaining',
    'Program log: sol_log_compute_units programs/arb_touyi/src/processor.rs:20',
    'Program consumption: 250388 units remaining',
    'Program log: iy:0 dx:0 oy:0',
    'Program log: iy:0 dx:0 oy:0',
    'Program log: AnchorError thrown in programs/arb_touyi/src/processor.rs:48. Error Code: NoProfit. Error Number: 6002. Error Message: Not Profit.',
    'Program DxeQQ7PQ94j26ism5ivTqNHAkteFNmgRpqYx7XQFqs9Z consumed 25565 of 268555 compute units',
    'Program DxeQQ7PQ94j26ism5ivTqNHAkteFNmgRpqYx7XQFqs9Z failed: custom program error: 0x1772',
    'Program 3SmBMUQe5QUpLc7wMrm97CRs3kXBSFtMZvPw8CDwZvUi consumed 56710 of 299700 compute units',
    'Program 3SmBMUQe5QUpLc7wMrm97CRs3kXBSFtMZvPw8CDwZvUi failed: custom program error: 0x1772'
  ]
}
```

The message `Error Message: Not Profit.` indicates that the bot has started running normally. The `Not Profit` error occurs because the simulation has already determined that there is no profit to be made, so the transaction will not be actually sent. Only when the simulation succeeds will the transaction be sent.

If you want all transactions to be broadcasted to the blockchain, you can configure `bot: "skipPreflight": false,`. After this configuration, all transactions will be broadcasted. However, note that even if a transaction fails, you will still incur gas fees.

Dry run mode can be toggled without editing the config by setting the `DRY_RUN` environment variable to `true` or `false`:

```bash
DRY_RUN=true node start.js
```

> **Note**: If the user's intermediate token account (e.g., trump) for arbitrage does not exist, the bot will automatically create it. If it exists, please ensure that the account balance is zero.

## 🌟 Arbitrage Principle

For any two trading pools, if there is a price difference, it may be possible to profit from arbitrage. Assume that:

- In trading pool 1, you use `a` SOL to buy `b` tokens of token X.
- In trading pool 2, you sell `b` tokens of token X to get `c` SOL.
- The potential profit: `p = c - a`

If `p` is greater than 0, arbitrage is possible; otherwise, it is not.

For arbitrage involving multiple trading pools, the optimal arbitrage route needs to be calculated in advance, and then the arbitrage is carried out according to the optimal route.

Due to the contract's computational power limitations, currently only one-hop optimal path calculation is supported, i.e., SOL -> X -> SOL. The contract will pair all input trading pools in pairs, calculate the optimal arbitrage path, and then conduct arbitrage according to the optimal path. If no profitable path is found, no arbitrage will be carried out, and the contract will report an error, causing the transaction to fail.

## 📅 How to Build Trust?

Since the contract code is not open-source, concerns may arise, such as:

- Will my private key be uploaded?
- Can the contract owner transfer all my tokens?

To address these concerns, we take the following measures to ensure the safety of your assets:

**Regarding the first concern**: The client code is completely open-source. You can see that in the client code, the private key is only used for local transaction signing and will not be uploaded to any third party or read by the contract.

**Regarding the second concern**: The arbitrage contract code is not open-source. Without proper protection, the contract owner could potentially transfer your tokens. Therefore, we have open-sourced a [Guard Contract](https://github.com/touyi/guard_contract) repository. The principle is as follows:

In the arbitrage contract, according to the client code, the user's token accounts input to the arbitrage contract only include:

- SOL account (automatically included as the signer)
- WSOL account (`userTokenBase`)
- Intermediate token account for arbitrage (`tokenPair0UserTokenAccountX`)

In the arbitrage contract, only the balances of these three accounts can be transferred.

The "intermediate token account for arbitrage" should have a zero balance, so there is no risk of loss from this account.

For SOL and WSOL, the [Guard Contract](https://github.com/touyi/guard_contract) ensures that the total amount of WSOL + SOL after the arbitrage contract is called is greater than the amount before the call. Otherwise, the contract will fail, and the entire transaction will be reverted. This mechanism guarantees that you will not suffer losses in the arbitrage contract. For the specific implementation, please refer to the [Guard Contract](https://github.com/touyi/guard_contract) code.

### Using the Guard Contract

#### Using the Publicly Deployed Guard Contract

Contract address: `3SmBMUQe5QUpLc7wMrm97CRs3kXBSFtMZvPw8CDwZvUi`

Configure the contract IDL path in the configuration. Currently, there is an IDL file for the publicly deployed guard contract in the `idl` directory of this code repository, named `guard_contract.json`. You can directly configure it in `config.js` as follows:

```json
"base": {
    // RPC request URL
    "rpcUrl": "", 
    // Wallet private key, an array of 32 numbers. Fill in either screctKey or screctKeyBase58.
    "screctKey": [], 
    // Wallet private key in Base58-encoded string. Fill in either screctKey or screctKeyBase58.
    "screctKeyBase58": "", 
    // If using the guard contract for submission, fill in the IDL file path of the guard contract.
    "guardContractIDL": "../idl/guard.json",
}
```

#### Deploying Your Own Guard Contract

For deployment instructions, refer to the [Guard Contract](https://github.com/touyi/guard_contract) repository.

After successful deployment, the configuration is the same as above. Make sure to specify the IDL path of your own deployed guard contract.

## 💰 Advanced Usage (Custom Contract Calls)

This section is intended for users with some coding skills. You can implement your own client, assemble your own trades, and define your own token sending strategies to submit arbitrage transactions.

### Input Definition of the Arbitrage Contract

#### Account Input

```rust
#[derive(Accounts)]
pub struct CommonAccountsInfo32<'info> {
    /// CHECK: NONE
    pub user: Signer<'info>, // Wallet address
    #[account(mut)]
    /// CHECK: NONE
    pub user_token_base: UncheckedAccount<'info>, // User's WSOL account
    #[account(mut)]
    /// CHECK: NONE
    pub token_base_mint: UncheckedAccount<'info>, // Mint address of WSOL: SOL111111111111111111111111111111111111111112
    
    #[account(mut)]
    /// CHECK: NONE
    pub token_program: UncheckedAccount<'info>, // Fixed: TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA

    #[account(address = anchor_lang::solana_program::system_program::ID)]
    /// CHECK: NONE
    pub sys_program: UncheckedAccount<'info>, // Fixed: 11111111111111111111111111111111

    #[account(mut)]
    /// CHECK: NONE
    pub token_pair_0_user_token_account_x: Option<UncheckedAccount<'info>>, // Intermediate token account for arbitrage
    #[account(mut)]
    /// CHECK: NONE
    pub token_pair_0_mint_x: Option<UncheckedAccount<'info>>, // Mint address of the intermediate token

    #[account(mut, address = RECIPIENT_PUBKEY)]
    /// CHECK: NONE
    pub recipient: AccountInfo<'info>, // Contract fee recipient account, fixed: B2kcKQCZUWvK59w9V9n7oDiFwqrh5FowymgpsKZV5NHu

    // The following are trading pool accounts, supporting a maximum of 29 accounts
    #[account(mut)]
    /// CHECK: NONE
    pub account_0: Option<UncheckedAccount<'info>>,
    #[account(mut)]
    /// CHECK: NONE
    pub account_1: Option<UncheckedAccount<'info>>,
    #[account(mut)]
    /// CHECK: NONE
    pub account_2: Option<UncheckedAccount<'info>>,
    ......
    ......
    #[account(mut)]
    /// CHECK: NONE
    pub account_27: Option<UncheckedAccount<'info>>,
    #[account(mut)]
    /// CHECK: NONE
    pub account_28: Option<UncheckedAccount<'info>>,
}
```

The input consists of two parts:

- **Basic Accounts (`accounts`)**: Fill in these accounts according to the above code.
- **Trading Pool Accounts**: These accounts are filled in according to certain rules. Here is an example of how to fill in the trading pool accounts using PumpSwap:

![image](https://github.com/touyi/solana-onchain-arbitrage-bot/blob/main/assets/pump.png)

For each trading pool, to call the CPI and complete a swap operation, the trading pool requires some input accounts. As shown in the figure above, the sell instruction requires 19 + 1 = 20 accounts (the additional account is the PumpSwap program account). Therefore, in the input of the arbitrage contract, 20 accounts (`account_0` - `account_19`) need to be reserved for the contract to fill in the input accounts of the trading pool.

In practice, you will find that many of these accounts are common accounts, such as the `user` account. These common accounts are filled in the basic accounts, while the trading pool accounts only need to fill in the accounts specific to the current trading pool, such as the `Pool` account. For specific implementations of different trading pools, refer to the fetcher implementations in the `solana-onchain-arbitrage-bot/src/pool_fetcher/` directory. For example, the fetcher implementation for PumpSwap is as follows:

```javascript
async getFillaccounts() {
    let input_accounts = [];
    input_accounts.push(this.pool_program);
    input_accounts.push(this.pool_key);
    input_accounts.push(this.global_config);
    input_accounts.push(this.base_mint_pool);
    input_accounts.push(this.quote_mint_pool);
    input_accounts.push(this.protocol_receiver);
    input_accounts.push(this.protocol_receiver_account);
    input_accounts.push(ASSOCIATED_TOKEN_PROGRAM_ID);
    input_accounts.push(this.authorith);
    input_accounts.push(this.coin_creator_vault_ata);
    input_accounts.push(this.coin_creator_auth);
    
    return input_accounts;
}
```

For each trading pool, simply fill in the corresponding accounts in this order. Multiple trading pools should be filled in the `account_xxx` fields of the arbitrage contract in sequence.

#### Parameter Input

The previous section explained how to fill in the trading pool accounts. However, when multiple trading pools are filled in the `account_xxx` fields, how does the arbitrage contract distinguish between these different pools and determine the type of each account segment? This is where additional parameter information comes in. The currently defined parameters for the instruction entry are as follows:

```rust
pub fn arb_process_32_account(
    ctx: Context<CommonAccountsInfo32>,
    max_in: u64,
    min_profit: u64,
    market_type: Vec<u8>,
    market_flag: Vec<u8>
);
```

There are four parameters:

- `max_in`: The maximum amount of WSOL to be used for purchasing, in lamports. This parameter limits the maximum input, and the actual input is determined through optimal calculation of the arbitrage path.
- `min_profit`: The minimum profit, in lamports. If the final profit of the transaction is less than this value, the transaction will fail.
- `market_type`: An array representing the types of trading pools. It describes the types of trading pools corresponding to the `account_xx` fields in the trading pool account section. Currently, different values represent the following:
  - 0: Meteora DLMM
  - 1: Raydium AMM
  - 2: PumpSwap
  - 3: Raydium CLMM
  - 4: Raydium CPMM
  - 5: Meteora Dynamic Pools
- `market_flag`: Information about trading pool processing. This field is a `u8` array, where each `u8` represents the processing information of a trading pool. Currently, only the highest bit is used, i.e., `(1 << 7) & flag`. If this bit is set to 1, it indicates that the corresponding trading pool is a **flipped pool**. The definition of a flipped pool is explained below.

#### Flipped Pools

The concept of flipped pools is introduced for convenient and unified abstraction. For all trading pools, each pool contains a trading pair of two tokens. For example, in the PumpSwap trading pair `5wNu5QhdpRGrL37ffcd6TMMqZugQgxwafgz477rShtHy`, the pool information usually records the mints of these two tokens. We refer to the first token as `Token_X` and the second as `Token_Y`, as shown below:

![image](https://github.com/touyi/solana-onchain-arbitrage-bot/blob/main/assets/Snipaste_2025-05-18_21-37-06.png)

`Token_X` is `Ce2gx9KGXJ6C9Mp5b5x1sn9Mg87JwEbrQby4Zqo3pump`

`Token_Y` is `So11111111111111111111111111111111111111112`

Since our current arbitrage support is limited to WSOL, we need to ensure that `Token_Y` in each trading pool is WSOL. If not, we need to flip the trading pool (the client does not flip the accounts during construction but simply passes an additional `market_flag` to indicate that `Token_Y` in this pool is not WSOL, and the contract will handle the flipping).

If you have more questions or need to report bugs, please join our discussion group: https://t.me/+t3Gexbnw0rs5NWQ1

## 🛎 Alerts and monitoring

The bot can send notifications to Telegram. Create a bot via BotFather and
take `botToken`, and get `chatId` from your chat. These values
can be specified in the config or via the environment variables `TELEGRAM_TOKEN` and
`TELEGRAM_CHAT_ID`.

Example of the `telegram` section in `config.json`:

```json
"telegram": {
  "enabled": true,
  "botToken": "YOUR_BOT_TOKEN",
  "chatId": "CHAT_ID",
  "profitNotify": false,
  "infoNotify": true
}
```

Available message levels:

- **CRITICAL** – fatal failure, inability to work
- **ALERT** – heartbeat failed several times in a row
- **ERROR** – transaction or adapter problems
- **WARNING** – unusual condition, low profit
- **PROFIT** – transaction report (by `profitNotify` flag)
- **INFO** – startup and recovery (by `infoNotify` flag)

Message examples:

```
🚨 [ALERT] HEARTBEAT
failed 3 times
2025-05-18T10:00:00Z
```

```
💰 [PROFIT] SIMULATE
raydium profit 1.23
2025-05-18T10:01:00Z
```

```
ℹ️ [INFO] HEARTBEAT
recovered after failure
2025-05-18T10:05:00Z
```

## 🛠 Custom Error Classes

The core uses a hierarchy of errors to make debugging and recovery easier:

```
ArbitrageError
├─ ConfigError
├─ NetworkError
├─ DataError
│   └─ PoolFetchError
├─ TxBuildError
└─ ExternalApiError
```

`PoolFetchError` inherits from `DataError` and is thrown when a DEX adapter fails to fetch pools. `TxBuildError` indicates a failure constructing a swap transaction. `NetworkError` wraps RPC related issues and is retried with exponential backoff. Any unrecoverable error is passed to `handleFatalError` which logs it and sends an alert when `ALERT_WEBHOOK` is configured.

Example usage:

```javascript
import { PoolFetchError } from './utils/errors.js';

try {
  await adapter.fetchPools(mint);
} catch (e) {
  throw new PoolFetchError(adapter.name, e);
}
```

## ❓ FAQ

 FAQ for Solana On-Chain Arbitrage Bot
1. Installation & Launch
Q: What do I need to run the bot?
A:

Windows, Linux, or MacOS

Node.js version 18.x or higher (download here)

Telegram (optional, for alerts)

Solana wallet and RPC endpoint

Q: How do I install and start the bot?
A:

Unzip the archive or clone the repository

Open a terminal/command prompt in the project folder

Run:


npm install
Copy the example config:


cp config/config.json.example config/config.json
Edit config.json with your details (wallet, rpcUrl, Telegram bot if needed)

Check your setup:


node start.js --check
First run should be in dry run mode:


node start.js --dry-run
If all is OK and there are no errors, run for real:


node start.js
2. Config Basics
Q: Where do I get the correct config.json?
A:

The repo/archive includes config/config.json.example

Just copy it as config.json and fill in your details

Q: How do I get a Solana RPC endpoint?
A:

You can use public endpoints:

https://api.mainnet-beta.solana.com

Or free ones from https://quicknode.com, https://helius.xyz, https://blockdaemon.com

For best results, use your own endpoint to avoid rate limits

Q: How do I create a wallet and get a private key?
A:

Easiest is Phantom or Sollet wallet

Export the private key as a base58 string or an array of numbers (see the example config)

Q: How do I get a Telegram bot token and chatId?
A:

Token: Use @BotFather to create a bot

chatId: Write to @userinfobot or add the bot to your chat/group

See the Telegram section in the README for more details

3. Startup Issues
Q: Error “Node.js version too low!”
A:

Download and install Node.js 18.x or higher from the official site

Check your version:


node -v
Q: “config.json not found!”
A:

Copy config/config.json.example to config/config.json and fill in your details

Q: “rpcUrl not defined” or “RPC connection error”
A:

Double-check the rpcUrl field in your config

Try a different RPC if your current one is down

Make sure your internet connection is working

Q: “Private key is invalid” error
A:

Check the privateKey field in config.json

Must be a base58 string or an array of numbers

Never share your private key!

Q: “Telegram error: botToken or chatId missing”
A:

Check the Telegram section in your config.json

If you don’t want Telegram alerts, set "enabled": false

4. Common Usage Questions
Q: How do I know the bot is working?
A:

The console will show messages like:

yaml
✅ Bot started, mode: dry run
INFO: Checking DEX Raydium...
PROFIT: Found a potential trade!
If Telegram alerts are enabled, you’ll get messages about profits or errors

Q: Can I run the bot on a different RPC or wallet?
A:

Yes, just change the settings in config.json

Always test with dry run after making changes

Q: How do I stop the bot?
A:

Press Ctrl+C in the console/terminal

For auto-start setups, use systemd, pm2, or similar tools (see README)

5. Telegram Alerts
Q: How do I enable or disable Telegram alerts?
A:

In config.json, under the telegram section:

"enabled": true — enabled

"enabled": false — disabled

Q: Not getting Telegram messages!
A:

Double-check botToken and chatId

Make sure the bot isn’t muted or blocked

Check your internet

Try sending a test alert with --check

Q: How do I get only critical alerts, not everything?
A:

In config.json, set profitNotify: false to disable profit notifications — only errors and critical events will be sent

6. Trading and Profit Issues
Q: Bot isn’t trading, only shows INFO messages
A:

Check your minProfit setting — maybe it’s too strict

Make sure the chosen tokens are actually traded on your DEX

Check your RPC for lag or connectivity issues

Q: “No pools for token X” error
A:

Token may be delisted or have low liquidity

Try different tokens or pools

Q: Bot made a losing trade or no profit
A:

Always test in dry run mode first!

Double-check your fee and slippage settings

Adjust your minProfit and limits as needed — market conditions may have changed

7. Operations, Updates, Migration
Q: How do I update the bot to a new version?
A:

Download the latest archive or do a git pull

Backup your old config.json

Replace the files

Check if the config format changed — see example config for new parameters

Reinstall dependencies:

npm install
Q: How do I move the bot to another computer?
A:

Copy the entire project folder and your config.json

Install Node.js

Run npm install and test

8. Security
Q: Is it safe to keep my private key in config.json?
A:

Never share your config.json with anyone

Don’t store config.json in public folders or cloud drives without protection

For extra safety, use .env files for secrets

Q: Can I run multiple bots with the same wallet?
A:

Not recommended: it can cause conflicts and duplicate trades

Use a separate wallet for each bot/instance

9. Frequent Errors & Solutions
Q: Bot won’t start, exits without message
A:

Did you copy and edit config.json?

Run with --check:


node start.js --check
Q: “Heartbeat fail” or “RPC not responding”
A:

RPC or network issue — try a different RPC or wait for Solana to recover

Check https://status.solana.com

Restart the bot after connectivity is restored

Q: No profit trades, even though the market is moving
A:

Check your minProfit, slippage, fee settings

Try lowering your thresholds if needed

10. Other / Additional
Q: Where are the bot’s logs?
A:

Logs are printed to the console by default

You can configure file logging via logger settings if needed

Q: Is there auto-update?
A:

No, update manually

Watch for updates on GitHub (or community chat/support)

Q: How do I add a new DEX or token?
A:

To add a token: just add it to the tokens list in config.json

To add a new DEX: see the “Adding Adapters” section in the README — usually, copy and adjust an existing adapter

If you can’t find your question — check the README, look in chats, or contact support/the developer!

Happy hunting for profit!
If something’s not working — ask! Any question is better than a silly mistake with real money :)

## 📚 Discussion Group

For questions or bug reports, please join our discussion group:
https://t.me/+t3Gexbnw0rs5NWQ1



## 🔍 Parser независим от бота

Экран подбора токенов и CLI-парсер работают полностью автономно и не требуют запущенного процесса бота.

- Подбор читает base/anchor токены из `BOT_CONFIG_PATH` (см. `.env.example`) и опрашивает DEX-адаптеры напрямую.
- Для парсера можно указать отдельный RPC через `PARSER_RPC_ENDPOINT`. При его отсутствии используется `RPC_ENDPOINT`.
- Бот по-прежнему управляется на странице `/run` и через `start.js`; его состояние не влияет на возможность обновлять кандидатов.
- CLI доступен командами `npm run parser:fetch -- --filters '{"minLiquidity":1000}'` и `npm run parser:write -- --filters '{...}'`.
- Опция `--dry-validate` позволяет проверить diff без записи в конфигурацию. Все изменения проходят через бэкап и diff.
