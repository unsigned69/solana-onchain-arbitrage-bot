
import * as utils from "../common/utils.js";

class ArbBot {
    constructor(config, connection) {
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