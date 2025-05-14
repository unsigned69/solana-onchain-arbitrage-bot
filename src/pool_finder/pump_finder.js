import * as utils from "../common/utils.js"
import * as constants from "../common/constants.js"
import { PoolKeyFinder, createNewMintXData, IsBaseMint } from "./pool_finder.js";
import path from "path";

const getYAwaysBaseMint = (x_info, y_info, x_is_base_mint) => {
    if (x_is_base_mint) {
        return [y_info, x_info];
    }

    return [x_info, y_info];
}

export class PumpPoolKeyFinder extends PoolKeyFinder {
    constructor() {
        const __dirname = path.dirname(new URL(import.meta.url).pathname);
        super(path.join(__dirname, "config/pump/"));
    }

    updateConfigByHttpData(mintX, data) {
        this.config[mintX] = [createNewMintXData(), data.expiration_time];
        if (!data || !data.data) {
            return;
        }
        data.data.forEach(poolInfo => {
            // 24h liquidity, USDT.
            if (!this.IsSufficientLiquidity(Number(poolInfo.liquidityUSD))) {
                return;
            }

            const x_type = IsBaseMint(poolInfo.baseMint);
            const y_type = IsBaseMint(poolInfo.quoteMint);

            // both base mint or both not base mint
            if ((x_type && y_type) || (!x_type && !y_type)) {
                return;
            }

            let [x_info, y_info] =  getYAwaysBaseMint({ address: poolInfo.baseMint}, { address: poolInfo.quoteMint}, x_type);
            const base_mint_name = utils.getBaseMintNameByAddress(y_info.address);
            this.config[x_info.address][0][base_mint_name].push({
                "type": POOLType.kPumpSwap,
                "pool_key": poolInfo.address,
                "meta": {}
            });
        });
    }

    getSearchSOLPoolUrl(mintX) {
        return `https://swap-api.pump.fun/v1/pools/pair?mintA=${constants.WSOL.toString()}&mintB=${mintX}`;
    }
}