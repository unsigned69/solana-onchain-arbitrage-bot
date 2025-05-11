import { PoolKeyFinder, createNewMintXData, IsBaseMint} from "./pool_finder.js";
import { POOLType } from "../utils/const.js.js"
import path from "path";
import { getYAwaysBaseMint } from "../utils/utils.js.js";

export class MeteoraAMMPoolKeyFinder extends PoolKeyFinder {
    constructor() {
        const __dirname = path.dirname(new URL(import.meta.url).pathname);
        super(path.join(__dirname, "config/meteora_amm/"));
    }

    updateConfigByHttpData(mintX, data) {
        this.config[mintX] = [createNewMintXData(), data.expiration_time];
        data.data.forEach(poolInfo => {
            if (!this.IsSufficientLiquidity(poolInfo.trading_volume)) {
                return;
            }

            const [xMintName, yMintName] = poolInfo.pool_name.split("-");
            const x_type = IsBaseMint(xMintName);
            const y_type = IsBaseMint(yMintName);
            if ((x_type && y_type) || (!x_type && !y_type)) {
                return;
            }

            let [x_info, y_info] =  getYAwaysBaseMint({ address: poolInfo.pool_token_mints[0], symbol: xMintName}, { address: poolInfo.pool_token_mints[1], symbol: yMintName}, x_type);
            const base_mint_name = y_info.symbol == "WSOL" ? "SOL": y_info.symbol;
            this.config[x_info.address][0][base_mint_name].push({
                "type": POOLType.kMeteoraAMM,
                "pool_key": poolInfo.pool_address,
                "meta": {}
            });
        });
    }

    getSearchSOLPoolUrl(mintX) {
        return `https://www.meteora.ag/amm/pools/search?page=0&size=100&filter=${mintX}&pool_type=dynamic&sort_key=volume&order_by=desc`
    }
}
