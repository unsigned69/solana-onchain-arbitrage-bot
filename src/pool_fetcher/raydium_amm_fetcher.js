import { Connection, PublicKey } from '@solana/web3.js'
import { jsonInfo2PoolKeys, Raydium, AMM_V4, AMM_STABLE, DEVNET_PROGRAM_ID} from '@raydium-io/raydium-sdk-v2'
import { Fetcher } from './fetcher.js'
const VALID_PROGRAM_ID = new Set([
  AMM_V4.toBase58(),
  AMM_STABLE.toBase58(),
  DEVNET_PROGRAM_ID.AmmV4.toBase58(),
  DEVNET_PROGRAM_ID.AmmStable.toBase58(),
])

export class RaydiumAMMFetcher extends Fetcher {
  constructor(pool_key, connection) {
    super();
    if (!(pool_key instanceof PublicKey)) {
      this.pool_key = new PublicKey(pool_key)
    } else {
      this.pool_key = pool_key
    }
    this.connection = connection
    this.raydium = null
    this.poolKeys = null
  }

  async incrmentFetch() {

  }

  async fetch(force = false) {
    if (this.raydium == null || force) {

    
      this.raydium = await Raydium.load({
        connection: this.connection,
        disableLoadToken: false
      });

      // const isValidAmm = (id) => VALID_PROGRAM_ID.has(id)
      // const isValidAmmPool = async (id) => {
      //   const poolInfos = await this.raydium.api.fetchPoolById({ ids: id });
      //   const poolInfo = poolInfos[0];
      //   if (!isValidAmm(poolInfo.programId))
      //     throw new Error('target pool is not AMM pool')
      // }

      // await isValidAmmPool(this.pool_key);
      this.poolKeys = await this.raydium.liquidity.getAmmPoolKeys(this.pool_key)
      this.poolKeys = jsonInfo2PoolKeys(this.poolKeys)
    }
  }

  mintY() {
    return this.poolKeys.mintB.address;
  }

  poolKey() {
    return this.pool_key;
  }

  typeIndex() {
    return 1;
  }

  async getFillaccounts() {
    let input_accounts = [];
    input_accounts.push(this.poolKeys.programId); // 0
    input_accounts.push(this.poolKeys.id); // 1
    input_accounts.push(this.poolKeys.authority); // 2
    input_accounts.push(this.poolKeys.vault.A); // 3
    input_accounts.push(this.poolKeys.vault.B); // 4

    return input_accounts;
  }

}
