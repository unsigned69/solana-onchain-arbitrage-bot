import dlmm from "@meteora-ag/dlmm";
import {
    PublicKey,
} from "@solana/web3.js";
import { Fetcher } from "./fetcher.js";
import { BN } from "bn.js";

const DLMM = dlmm.default;
export class MeteoraDLMMFetcher extends Fetcher  {
    constructor(pool_key, connection) {
        super();
        if (!(pool_key instanceof PublicKey)) {
            this.pool_key = new PublicKey(pool_key)
        } else {
            this.pool_key = pool_key
        }
        this.connection = connection
        this.dlmmPool = null
        this.activeBins = null
        this.fetch_cd = 35000;
        this.last_fetch_time = 0;
    }

    async incrmentFetch() {
        if (Date.now() - this.last_fetch_time > this.fetch_cd) {
            await this.fetch(true);
        }
    }

    async fetch(force = false) {
        if (this.dlmmPool == null || force) {
            this.dlmmPool = await DLMM.create(this.connection, this.pool_key);
        }

        const activ_id = dlmm.binIdToBinArrayIndex(new BN(this.dlmmPool.lbPair.activeId));
        const res =  await dlmm.deriveBinArray(this.dlmmPool.pubkey, new BN(activ_id - 1), this.dlmmPool.program.programId);
        const res2 =  await dlmm.deriveBinArray(this.dlmmPool.pubkey, new BN(activ_id), this.dlmmPool.program.programId);
        const res3 =  await dlmm.deriveBinArray(this.dlmmPool.pubkey, new BN(activ_id + 1), this.dlmmPool.program.programId);
        this.activeBins = [res[0], res2[0], res3[0]];
        this.last_fetch_time = Date.now();
    }

    mintY() {
        return this.dlmmPool.lbPair.tokenYMint;
    }

    poolKey() {
        return this.pool_key;
    }
    typeIndex() {
        return 0;
    }

    async getFillaccounts() {
        let input_accounts = [];
        input_accounts.push(this.pool_key);
        input_accounts.push(this.dlmmPool.binArrayBitmapExtension ? this.dlmmPool.binArrayBitmapExtension.publicKey : null);
        input_accounts.push(this.dlmmPool.lbPair.reserveX);
        input_accounts.push(this.dlmmPool.lbPair.reserveY);
        input_accounts.push(this.dlmmPool.lbPair.oracle);
        input_accounts.push(new PublicKey("D1ZN9Wj1fRSUQfCjhvnu1hqDMT7hzjzBBpi12nVniYD6"));
        input_accounts.push(new PublicKey("LBUZKhRxPF3XUpBCjp4YzTKgLccjZhTSDM9YuVaPwxo"));
        for (let i = 0; i < this.activeBins.length; i++) {
            input_accounts.push(this.activeBins[i]);
        }

        return input_accounts;
    }
}
