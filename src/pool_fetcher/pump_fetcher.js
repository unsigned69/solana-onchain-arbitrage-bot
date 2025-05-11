import {
    Connection,
    PublicKey,
    Keypair,
    ComputeBudgetProgram,
    TransactionMessage,
    VersionedTransaction,
  } from "@solana/web3.js";

import {
    ASSOCIATED_TOKEN_PROGRAM_ID,
    TOKEN_PROGRAM_ID
} from "@solana/spl-token";
import { Fetcher } from "./fetcher.js";

export class PumpSwapFetcher extends Fetcher {
    constructor(pool_key, connection) {
        super();
        if (!(pool_key instanceof PublicKey)) {
            this.pool_key = new PublicKey(pool_key)
        } else {
            this.pool_key = pool_key
        }
        this.connection = connection;
        this.base_mint = null;
        this.quote_mint = null;
        this.base_mint_pool = null;
        this.quote_mint_pool = null;
        this.global_config = new PublicKey("ADyA8hdefvWN2dbGGWFotbzWxrAvLW83WG6QCVXvJKqw")
        this.protocol_receiver = new PublicKey("JCRGumoE9Qi5BBgULTgdgTLjSgkCMSbF62ZZfGs84JeU")
        this.authorith = new PublicKey("GS4CU59F31iL7aR2Q8zVS8DRrcRnXX1yjQ66TqNVQnaR")
        this.pool_program = new PublicKey("pAMMBay6oceH9fJKBRHGP5D4bD4sWpmSwMn52FMfXEA")
        this.protocol_receiver_account = null;
    }

    async incrmentFetch() {

    }

    typeIndex() {
        return 2;
    }

    mintY() {
        return this.quote_mint;
    }

    poolKey() {
        return this.pool_key;
    }

    async fetch(force = false) {
        if (this.base_mint == null || force) {
            const account = await this.connection.getAccountInfo(this.pool_key)
            this.base_mint = new PublicKey(account.data.subarray(8 + 3 + 32, 8 + 3 + 32 + 32))
            this.quote_mint = new PublicKey(account.data.subarray(8 + 3 + 32 + 32, 8 + 3 + 32 + 32 + 32))
            this.base_mint_pool = new PublicKey(account.data.subarray(8 + 3 + 32 + 32 + 32 + 32, 8 + 3 + 32 + 32 + 32 + 32 + 32))
            this.quote_mint_pool = new PublicKey(account.data.subarray(8 + 3 + 32 + 32 + 32 + 32 + 32, 8 + 3 + 32 + 32 + 32 + 32 + 32 + 32))

            this.protocol_receiver_account = PublicKey.findProgramAddressSync([
                this.protocol_receiver.toBuffer(),
                TOKEN_PROGRAM_ID.toBuffer(),
                this.quote_mint.toBuffer(),
            ], ASSOCIATED_TOKEN_PROGRAM_ID)[0]
        }
        
    }


    async getFillaccounts() {
        let input_accounts = []
        input_accounts.push(this.pool_program);
        input_accounts.push(this.pool_key);
        input_accounts.push(this.global_config);
        input_accounts.push(this.base_mint_pool);
        input_accounts.push(this.quote_mint_pool);
        input_accounts.push(this.protocol_receiver);
        input_accounts.push(this.protocol_receiver_account);
        input_accounts.push(ASSOCIATED_TOKEN_PROGRAM_ID);
        input_accounts.push(this.authorith);
        
        return input_accounts;
    }
}