import {
    Connection,
    PublicKey,
    Keypair,
    ComputeBudgetProgram,
    TransactionMessage,
    VersionedTransaction,
  } from "@solana/web3.js";
import { Fetcher } from "./fetcher.js";
const OBSERVATION_SEED = Buffer.from("observation", "utf8");

export class RaydiumCPMMFetcher extends Fetcher {
    constructor(pool_key, connection) {
        super();
        if (!(pool_key instanceof PublicKey)) {
            this.pool_key = new PublicKey(pool_key)
        } else {
            this.pool_key = pool_key
        }
        this.connection = connection;

        this.programId = new PublicKey("CPMMoo8L3F4NbTegBCKVNunggL7H1ZpdTHKxQB5qKP1C");
        this.authority = new PublicKey("GpMZbSM2GgvTKHJirzeGfMFoaZ8UR2X7F4v8vHTvxFbL");
        this.ammConfig = null;
        this.tokenXVault = null;
        this.tokenYVault = null;
        this.tokenXProgram = null;
        this.tokenYProgram = null;
        this.mintTokenX = null;
        this.mintTokenY = null;
        this.observation = null;
    }

    async incrmentFetch() {

    }

    typeIndex() {
        return 4;
    }

    mintY() {
        return this.mintTokenY;
    }

    poolKey() {
        return this.pool_key;
    }

    async fetch(force = false) {
        if (this.ammConfig == null || force) {
            const poolState = await this.connection.getAccountInfo(this.pool_key);
            this.ammConfig = new PublicKey(poolState.data.subarray(8, 8 + 32));
            this.tokenXVault = new PublicKey(poolState.data.subarray(8 + 32 + 32, 8 + 32 + 32 + 32));
            this.tokenYVault = new PublicKey(poolState.data.subarray(8 + 32 + 32 + 32, 8 + 32 + 32 + 32 + 32));
            this.mintTokenX = new PublicKey(poolState.data.subarray(8 + 32 + 32 + 32 + 32 + 32, 8 + 32 + 32 + 32 + 32 + 32 + 32));
            this.mintTokenY = new PublicKey(poolState.data.subarray(8 + 32 + 32 + 32 + 32 + 32 + 32, 8 + 32 + 32 + 32 + 32 + 32 + 32 + 32));
            this.tokenXProgram = new PublicKey(poolState.data.subarray(8 + 32 + 32 + 32 + 32 + 32 + 32 + 32, 8 + 32 + 32 + 32 + 32 + 32 + 32 + 32 + 32));
            this.tokenYProgram = new PublicKey(poolState.data.subarray(8 + 32 + 32 + 32 + 32 + 32 + 32 + 32 + 32, 8 + 32 + 32 + 32 + 32 + 32 + 32 + 32 + 32 + 32));
            this.observation = PublicKey.findProgramAddressSync([OBSERVATION_SEED, this.pool_key.toBuffer()], this.programId)[0];
        }
        
    }


    async getFillaccounts() {
        let input_accounts = []
        input_accounts.push(this.programId);
        input_accounts.push(this.authority);
        input_accounts.push(this.ammConfig);
        input_accounts.push(this.pool_key);
        input_accounts.push(this.tokenXVault);
        input_accounts.push(this.tokenYVault);
        input_accounts.push(this.tokenXProgram);
        input_accounts.push(this.tokenYProgram);
        input_accounts.push(this.observation);
        return input_accounts;
    }
}