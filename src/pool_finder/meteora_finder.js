import { PoolKeyFinder, createNewMintXData, IsBaseMint} from "./pool_finder.js";
import * as utils from "../common/utils.js"
import * as constants from "../common/constants.js"

import path from "path";

export class MeteoraPoolKeyFinder extends PoolKeyFinder {
    constructor() {
        const __dirname = path.dirname(new URL(import.meta.url).pathname);
        super(path.join(__dirname, "config/meteora/"));
    }

    updateConfigByHttpData(mintX, data) {
        this.config[mintX] = [createNewMintXData(), data.expiration_time];
        data.groups.forEach(element => {
            element.pairs.forEach(poolInfo => {
                // 24h liquidity, USDT.
                if (!this.IsSufficientLiquidity(poolInfo.trade_volume_24h)) {
                    return;
                }

                const [xMintName, yMintName] = poolInfo.name.split("-");
                const x_type = IsBaseMint(xMintName);
                const y_type = IsBaseMint(yMintName);

                // both base mint or both not base mint
                if ((x_type && y_type) || (!x_type && !y_type)) {
                    return;
                }

                let [x_info, y_info] =  utils.getYAwaysBaseMint({ address: poolInfo.mint_x, symbol: xMintName}, { address: poolInfo.mint_y, symbol: yMintName}, x_type);

                const base_mint_name = y_info.symbol == "WSOL" ? "SOL": y_info.symbol;
                this.config[x_info.address][0][base_mint_name].push({
                    "type": constants.POOLType.kMeteoraDLMM,
                    "pool_key": poolInfo.address,
                    "meta": {}
                });
            });
        });
    }

    getSearchSOLPoolUrl(mintX) {
        // only dlmm now!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!11111
        return `https://www.meteora.ag/clmm-api/pair/all_by_groups?page=0&limit=100&unknown=true&search_term=${mintX}&sort_key=volume&order_by=desc`
    }
}