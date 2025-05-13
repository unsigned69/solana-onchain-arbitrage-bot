
import * as utils from "../common/utils.js";

class ArbBot {
    constructor(config, connection, poolFinderList) {
        this.pendingMintX = []
        this.runningMintX = []
        this.poolFinderList = poolFinderList
        this.user = null;
    }

    
    async processMintX(mintX) {
        console.log("processMintX:", mintX)
        try {
            let mintXData = {
                "USDT": [],
                "USDC": [],
                "SOL": [],
            };
            for (let index = 0; index < this.runningMintX.length; index++) {
                if (this.runningMintX[index].getMintX().toString() === mintX.toString()) {
                    console.log("processMintX: already running:", mintX)
                    // 删除尝试重新获取池
                    this.runningMintX = [
                        ...this.runningMintX.slice(0, index),
                        ...this.runningMintX.slice(index + 1),
                    ]
                }
            }
            const getFirstThreeSupportPools = (poolInfos, size) => {
                if (!poolInfos) {
                    return [];
                }
                return poolInfos.filter(poolInfo => utils.IsSupportPool(poolInfo.type)).slice(0, size);
            }

            for (let finder of this.poolFinderList) {
                let data = await finder.getPoolKey(mintX);
                let size = 3;
                mintXData.USDT = mintXData.USDT.concat(getFirstThreeSupportPools(data.USDT, size));
                mintXData.USDC = mintXData.USDC.concat(getFirstThreeSupportPools(data.USDC, size));
                mintXData.SOL = mintXData.SOL.concat(getFirstThreeSupportPools(data.SOL, size));
            }
            if (mintXData.SOL.length < 2) {
                console.log("processMintX: length no support :", mintX)
                return;
            }
            // TODO(touyi)
            const handler = new MintXHandler(mintX, mintXData, this.connection, true);
            await handler.init();
            await utils.createATATokenAccount(handler.getMintX(), this.connection, this.user, true);
            this.runningMintX.push(handler);
            this.runningMintX = [...this.runningMintX.slice(-this.maxRunningMintX)]
            console.log("processMintX Success:", mintX)
        } catch (e) {
            console.log("processMintX: ", e);
        }
    }

    
    async processPendingMintXMain() {
        while (true) {
            if (this.pendingMintX.length > 0) {
                const newMintXList = [...this.pendingMintX];
                this.pendingMintX = [];
                for (let i = 0; i < newMintXList.length; i++) {
                    await this.processMintX(newMintXList[i]);
                }
            } else {
                await new Promise((resolve) => setTimeout(resolve, 1000));
            }
        }
    }

    // 构造交易并发送
    async transactionConstructorMain() {

    }

    async run() {
        promises = [];
        promises.push(utils.GuardForeverRun(async () => {
            await this.transactionConstructorMain();
        }));
    }
}