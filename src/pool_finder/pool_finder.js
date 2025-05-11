
// import Puppeteer from ""

// function GetHotCoinList() {
    
// }

/*
{
  "mint_x": "abc",
  "USDT" : [
    {
      "type": "raydium_amm",
      "pool_key": "xxx",
      "subkeys": ["aaa", "bbb"],
      "meta": {}
    }
  ],
  "SOL": [
    {
      "type": "raydium_amm",
      "pool_key": "xxx",
      "subkeys": ["aaa", "bbb"],
      "meta": {}
    }
  ],
  "USDC":[]
}
*/

import fs from "fs";
import path from "path";
import https from "https";
import { USDC, USDT, WSOL } from "../utils/const.js.js";

let BaseMint = ["WSOL", "SOL", "USDC", "USDT", WSOL.toString(), USDC.toString(), USDT.toString()];
export function IsBaseMint(symbol) {
  return BaseMint.includes(symbol);
}

export function createNewMintXData() {
  return {
    "USDT": [],
    "USDC": [],
    "SOL": [],
  };
}

export class PoolKeyFinder {
    // mintX -> { USDT: {}, USDC: {}, SOL: {}}
    config = {};

    constructor(configCachePath) {
      this.configCachePath = configCachePath;

      try {
          this.loadLocalCache();
      } catch(e) {
          console.log(e);
      }
    }

    IsSufficientLiquidity(liquidity) {
      // 24h, USDT.
      return liquidity > 10000
    }

    loadLocalCache() {
        if (!fs.existsSync(this.configCachePath)) {
            fs.mkdirSync(this.configCachePath);
        }

        fs.readdirSync(this.configCachePath).forEach(subFileName => {
            const subPath =  path.join(this.configCachePath, subFileName);
            this.updateConfigByHttpData(subFileName.split(".")[0], JSON.parse(fs.readFileSync(subPath)));
        });
    }

    async getPoolKey(mintX, tryUpdate = true) { // if config has mintX and not outdated.
      // console.log(this.config);
      if (this.config[mintX] && (!tryUpdate || this.config[mintX][1] > Date.now())) {
        return this.config[mintX][0];
      }
      await this.tryUpdateMintXInfo(mintX);
      if (this.config[mintX] && this.config[mintX][1] > Date.now()) {
        return this.config[mintX][0];
      }

      return createNewMintXData();
    }


    async tryUpdateMintXInfo(mintX, callback) {
      return new Promise((resolve, reject) => {
        https.get(this.getSearchSOLPoolUrl(mintX), (res) => {
          let data = "";
          res.on('data', (d) => {
              data += d;
          });
          res.on("end", () => {
              try {
                data = JSON.parse(data);
                if (Array.isArray(data)) {
                  data = { "data": data };
                }
                // expiration_time 1800000ms ---> half hour.
                data.expiration_time = Date.now() + 1800000;
                fs.writeFileSync(this.configCachePath + mintX + ".json", JSON.stringify(data, null, 4));
                this.updateConfigByHttpData(mintX, data);
              } catch(e) {
                console.log(e);
              }
              resolve();
          });

          res.on("error", (e) => { resolve(); });
        });
      })
    }

    // interface
    updateConfigByHttpData(mintX, data) {}
    getSearchSOLPoolUrl(mintX) {}
}

// save cache.
