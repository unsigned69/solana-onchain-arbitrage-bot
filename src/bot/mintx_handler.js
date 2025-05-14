import {
    PublicKey,
} from "@solana/web3.js";
import { PumpSwapFetcher } from "../pool_fetcher/pump_fetcher.js";
import { MeteoraDLMMFetcher } from "../pool_fetcher/meteora_dlmm_fetcher.js";
import { RaydiumAMMFetcher } from "../pool_fetcher/raydium_amm_fetcher.js";
import { RaydiumCLMMFetcher } from "../pool_fetcher/raydium_clmm_fetcher.js";
import { RaydiumCPMMFetcher } from "../pool_fetcher/raydium_cpmm_fetcher.js";
import { MeteoraAmmFetcher } from "../pool_fetcher/meteora_amm_fetcher.js";
import * as constants from "../common/constants.js";
import * as utils from "../common/utils.js";
/*
MintXData:

{
    "USDT": [
      {
        "type": "raydium_amm",
        "pool_key": "xxx",
        "meta": {}
      }
    ],
    "SOL": [
      {
        "type": "raydium_amm",
        "pool_key": "xxx",
        "meta": {}
      }
    ],
    "USDC": [
      {
        "type": "raydium_amm",
        "pool_key": "xxx",
        "meta": {}
      }
    ]
}


*/

export class MintXHandler {
    constructor(mintX, mintXData, connection, disableAlt = false) {
        if (!(mintX instanceof PublicKey)) {
            this.mintX = new PublicKey(mintX);
        } else {
            this.mintX = mintX;
        }
        
        if (typeof mintXData === "string") {
            this.mintXData = JSON.parse(mintXData);
        } else {
            this.mintXData = mintXData;
        }
        this.disableAlt = disableAlt;
        this.connection = connection;
        this.fetcher_list_map = {};
        this.fetcher_list_alt_account_map = {}
        this.fetcher_list_offset_map = {}
        this.createTime = Date.now();
    }

    getCreateTime() {
        return this.createTime;
    }

    getMintX() {
        return this.mintX;
    }

    async createFetcherlist(pool_meta_list) {
        /*
        [
            {
                "type": "raydium_amm",
                "pool_key": "xxx",
                "meta": {}
            }
        ]
         */
        let pool_list = [];
        let alt_account_list = [];
        for (const pool_meta of pool_meta_list) {
            if (pool_meta.type === constants.POOLType.kPumpSwap) {
                const pool_key = new PublicKey(pool_meta.pool_key);
                const fetcher = new PumpSwapFetcher(pool_key, this.connection);
                await fetcher.fetch();
                pool_list.push(fetcher);
            } else if (pool_meta.type === constants.POOLType.kRaydiumAMM) {
                const pool_key = new PublicKey(pool_meta.pool_key);
                const fetcher = new RaydiumAMMFetcher(pool_key, this.connection);
                await fetcher.fetch();
                pool_list.push(fetcher);
            } else if (pool_meta.type === constants.POOLType.kMeteoraDLMM) {
                const pool_key = new PublicKey(pool_meta.pool_key);
                const fetcher = new MeteoraDLMMFetcher(pool_key, this.connection);
                await fetcher.fetch();
                pool_list.push(fetcher);
            } else if (pool_meta.type === constants.POOLType.kRaydiumCLMM) {
                const pool_key = new PublicKey(pool_meta.pool_key);
                const fetcher = new RaydiumCLMMFetcher(pool_key, this.connection);
                await fetcher.fetch();
                pool_list.push(fetcher);
            } else if (pool_meta.type === constants.POOLType.kRaydiumCPMM) {
                const pool_key = new PublicKey(pool_meta.pool_key);
                const fetcher = new RaydiumCPMMFetcher(pool_key, this.connection);
                await fetcher.fetch();
                pool_list.push(fetcher);
            } else if (pool_meta.type === constants.POOLType.kMeteoraAMM) {
                const pool_key = new PublicKey(pool_meta.pool_key);
                const fetcher = new MeteoraAmmFetcher(pool_key, this.connection);
                await fetcher.fetch();
                pool_list.push(fetcher);
            } else {
                throw new Error("Unknown pool type");
            }
            if (!this.disableAlt) {
                try {
                    let lookup_table = (await this.connection.getAddressLookupTable(new PublicKey(pool_meta.meta["alt_key"]))).value
                    alt_account_list.push(lookup_table);
                } catch (e) {
                    console.error(e);
                    alt_account_list.push(null);
                }
            } else {
                alt_account_list.push(null);
            }
            
        }
        return {pool_list, alt_account_list};
    }

    async init() {
        if ("SOL" in this.mintXData) {
            const { pool_list, alt_account_list } = await this.createFetcherlist(this.mintXData["SOL"]);
            this.fetcher_list_map["SOL"] = pool_list;
            this.fetcher_list_alt_account_map["SOL"] = alt_account_list;
            this.fetcher_list_offset_map["SOL"] = 0;
        }
        if ("USDC" in this.mintXData) {
            const { pool_list, alt_account_list } = await this.createFetcherlist(this.mintXData["USDC"]);
            this.fetcher_list_map["USDC"] = pool_list;
            this.fetcher_list_alt_account_map["USDC"] = alt_account_list;
            this.fetcher_list_offset_map["USDC"] = 0;
        }
        if ("USDT" in this.mintXData) {
            const { pool_list, alt_account_list } = await this.createFetcherlist(this.mintXData["USDT"]);
            this.fetcher_list_map["USDT"] = pool_list;
            this.fetcher_list_alt_account_map["USDT"] = alt_account_list;
            this.fetcher_list_offset_map["USDT"] = 0;
        }
    }

    containBaseTokenType(base_token_type) {
        return base_token_type in this.fetcher_list_map && this.fetcher_list_map[base_token_type].length > 1;
    }

    async fillAccounts(input_accounts, 
                        input_alt_accounts, 
                        reverse_flag_list,
                        type_index_list,
                        base_token_type, 
                        max_fill_size,
                        randomSelect = false) {
        const baseTokenType2Mint = {
            "SOL": constants.WSOL,
            "USDC": constants.USDC,
            "USDT": constants.USDT
        }
        if (base_token_type in this.fetcher_list_map) {
            const max_len = this.fetcher_list_map[base_token_type].length;
            const offset = this.fetcher_list_offset_map[base_token_type]
            this.fetcher_list_offset_map[base_token_type] += 1;
            this.fetcher_list_offset_map[base_token_type] %= max_len;
            let selectIndices = Array.from({ length: max_len }, (_, i) => i);
            if (randomSelect) {
                selectIndices = utils.getRandomElements(selectIndices, max_len);
            }
            let fill_pool_size = 0;
            for (let index = 0; index < max_len; index += 1) {
                let selectIndex = selectIndices[index];
                const fetcher = this.fetcher_list_map[base_token_type][(offset + selectIndex) % max_len]
                const alt_account = this.fetcher_list_alt_account_map[base_token_type][(offset + selectIndex) % max_len]
                fetcher.incrmentFetch();
                let extend_accounts = await fetcher.getFillaccounts();
                if (input_accounts.length + extend_accounts.length > max_fill_size) {
                    if (fill_pool_size <= 1) {
                        console.error("fill_pool_size <= 1", fill_pool_size);
                    }
                    break;
                }
                input_accounts.push(...extend_accounts);
                if (alt_account) {
                    input_alt_accounts.push(alt_account);
                }
                type_index_list.push(fetcher.typeIndex());
                if (fetcher.mintY().equals(baseTokenType2Mint[base_token_type])) {
                    reverse_flag_list.push(0x00);
                } else {
                    reverse_flag_list.push(0x80);
                }
                fill_pool_size += 1
            }
        }
    }
}