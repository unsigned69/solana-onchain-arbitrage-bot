import { PoolKeyFinder , IsBaseMint, createNewMintXData} from "./pool_finder.js";
import * as utils from "../common/utils.js"
import * as constants from "../common/constants.js"

import path from "path";


const getPoolTypeByProgramId = (programId)=>{
    if (programId === "675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8") {
        return constants.POOLType.kRaydiumAMM;
    }

    if (programId === "CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK") {
        return constants.POOLType.kRaydiumCLMM;
    }

    if (programId === "CPMMoo8L3F4NbTegBCKVNunggL7H1ZpdTHKxQB5qKP1C") {
        return constants.POOLType.kRaydiumCPMM;
    }

    return "other";
}

export class RaydiumPoolKeyFinder extends PoolKeyFinder {
    constructor() {
        const __dirname = path.dirname(new URL(import.meta.url).pathname);
        super(path.join(__dirname, "config/raydium/"));
    }

    updateConfigByHttpData(mintX, data) {
        this.config[mintX] = [createNewMintXData(), data.expiration_time];
        // console.log(" RaydiumPoolKeyFinder load data ", data.data.data);
        data.data.data.forEach(poolInfo => {
            // 24h liquidity, USDT.
            if (!this.IsSufficientLiquidity(poolInfo.day.volume)) {
                return;
            }

            const x_type = IsBaseMint(poolInfo.mintA.symbol);
            const y_type = IsBaseMint(poolInfo.mintB.symbol);

            // both base mint or both not base mint
            if ((x_type && y_type) || (!x_type && !y_type)) {
                return;
            }

            let [x_info, y_info] = utils.getYAwaysBaseMint(poolInfo.mintA, poolInfo.mintB, x_type);

            const base_mint_name = y_info.symbol == "WSOL" ? "SOL": y_info.symbol;
            this.config[x_info.address][0][base_mint_name].push({
                "type": getPoolTypeByProgramId(poolInfo.programId),
                "pool_key": poolInfo.id,
                "meta": {}
            });
        });
    }

    getSearchSOLPoolUrl(mintX) {
        return `https://api-v3.raydium.io/pools/info/mint?mint1=${mintX}&mint2=${constants.WSOL.toString()}&poolType=all&poolSortField=volume24h&sortType=desc&pageSize=20&page=1`
    }
}