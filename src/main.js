import { globalConfig } from "./config.js";
import { ArbBot } from "./bot/arb_bot.js";
import { MeteoraAMMPoolKeyFinder } from "./pool_finder/meteora_amm_finder.js";
import { MeteoraPoolKeyFinder } from "./pool_finder/meteora_finder.js";
import { RaydiumPoolKeyFinder } from "./pool_finder/raydium_finder.js";
import { PumpPoolKeyFinder } from "./pool_finder/pump_finder.js";
import {
    Connection,
} from "@solana/web3.js";


(async () => {
    const connection = new Connection(globalConfig.base.rpcUrl)
    const poolFinderList = [
        new MeteoraAMMPoolKeyFinder(),
        new MeteoraPoolKeyFinder(),
        new RaydiumPoolKeyFinder(),
        new PumpPoolKeyFinder(),
    ];

    const bot = new ArbBot(globalConfig, connection, poolFinderList);
    await bot.run()
})();