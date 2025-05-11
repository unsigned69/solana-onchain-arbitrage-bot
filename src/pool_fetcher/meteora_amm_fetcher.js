import { Connection, PublicKey } from '@solana/web3.js'
import { Fetcher } from './fetcher.js'
import { RichConfig } from '../utils/arb_pool_config.js';

export class MeteoraAmmFetcher extends Fetcher {
  constructor(pool_key, connection) {
    super();
    if (!(pool_key instanceof PublicKey)) {
      this.pool_key = new PublicKey(pool_key)
    } else {
      this.pool_key = pool_key
    }
    this.connection = connection
    this.programId = new PublicKey("Eo7WjKq67rjJQSZxS6z3YkapzY3eMj6Xy8X5EQVn5UaB");
    this.vaultProgram = new PublicKey("24Uqj9JCLxUeoC3hGfh5W3s9FM9uCHDS2SG3LYwBpyTi");
    this.tokenXMint = null;
    this.tokenYMint = null;

    this.xVault = null;
    this.yVault = null;
    this.xTokenVault = null;
    this.yTokenVault = null;
    this.xVaultLpMint = null;
    this.yVaultLpMint = null;
    this.xVaultLp = null;
    this.yVaultLp = null;
    this.protocolTokenFeeX = null;
    this.protocolTokenFeeY = null;
  }

  async incrmentFetch() {

  }

  async fetch(force = false) {
    if (this.tokenXMint == null || force) {
      const poolState = await this.connection.getAccountInfo(this.pool_key);
      this.tokenXMint = new PublicKey(poolState.data.subarray(8 + 32, 8 + 32 + 32));
      this.tokenYMint = new PublicKey(poolState.data.subarray(8 + 32 + 32, 8 + 32 + 32 + 32));

      this.xVault = new PublicKey(poolState.data.subarray(8 + 32 + 32 + 32, 8 + 32 + 32 + 32 + 32));
      this.yVault = new PublicKey(poolState.data.subarray(8 + 32 + 32 + 32 + 32, 8 + 32 + 32 + 32 + 32 + 32));

      const xVaultAcc = await this.connection.getAccountInfo(this.xVault);
      const yVaultAcc = await this.connection.getAccountInfo(this.yVault);

      this.xTokenVault = new PublicKey(xVaultAcc.data.subarray(19, 19 + 32));
      this.yTokenVault = new PublicKey(yVaultAcc.data.subarray(19, 19 + 32));

      this.xVaultLpMint = new PublicKey(xVaultAcc.data.subarray(19 + 32 * 3, 19 + 32 * 3 + 32));
      this.yVaultLpMint = new PublicKey(yVaultAcc.data.subarray(19 + 32 * 3, 19 + 32 * 3 + 32));

      this.xVaultLp = new PublicKey(poolState.data.subarray(8 + 32 + 32 + 32 + 32 + 32, 8 + 32 + 32 + 32 + 32 + 32 + 32));
      this.yVaultLp = new PublicKey(poolState.data.subarray(8 + 32 + 32 + 32 + 32 + 32 + 32, 8 + 32 + 32 + 32 + 32 + 32 + 32 + 32));

      this.protocolTokenFeeX = new PublicKey(poolState.data.subarray(8 + 32 + 32 + 32 + 32 + 32 + 32 + 32 + 2, 8 + 32 + 32 + 32 + 32 + 32 + 32 + 32 + 2 + 32));
      this.protocolTokenFeeY = new PublicKey(poolState.data.subarray(8 + 32 + 32 + 32 + 32 + 32 + 32 + 32 + 2 + 32, 8 + 32 + 32 + 32 + 32 + 32 + 32 + 32 + 2 + 32 + 32));

    }
  }

  mintY() {
    return this.tokenYMint;
  }

  poolKey() {
    return this.pool_key;
  }

  typeIndex() {
    return 5;
  }

  async getFillaccounts() {
    let input_accounts = [];
    input_accounts.push(this.programId);
    input_accounts.push(this.pool_key);
    input_accounts.push(this.xVault);
    input_accounts.push(this.yVault);
    input_accounts.push(this.xTokenVault);
    input_accounts.push(this.yTokenVault);
    input_accounts.push(this.xVaultLpMint);
    input_accounts.push(this.yVaultLpMint);
    input_accounts.push(this.xVaultLp);
    input_accounts.push(this.yVaultLp);
    input_accounts.push(this.protocolTokenFeeX);
    input_accounts.push(this.protocolTokenFeeY);
    input_accounts.push(this.vaultProgram);
    return input_accounts;
  }

}

// const connection = new Connection(RichConfig.apiUrl);
// const fetcher = new MeteoraAmmFetcher("B1AdQ85N2mJ2xtMg9bgThhsPoA6T3M26rt4TChWSiPpr", connection);
// await fetcher.fetch();

// const input_accounts = await fetcher.getFillaccounts();
// console.log(input_accounts.map((item) => item.toBase58()));

