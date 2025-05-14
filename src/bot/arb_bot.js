
import * as utils from "../common/utils.js";
import * as constants from "../common/constants.js";
import { MintXHandler } from "./mintx_handler.js";
import {
    Connection,
    PublicKey,
    Transaction,
    ComputeBudgetProgram,
    TransactionMessage,
    VersionedTransaction,
    SystemProgram,
    Keypair,
} from "@solana/web3.js"
import { Program, AnchorProvider, Wallet } from '@coral-xyz/anchor';
import fs from "fs";
import {
    ASSOCIATED_TOKEN_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import BN from "bn.js";


const ACCOUNT_SIZE = 29;

export class ArbBot {
    constructor(config, connection, poolFinderList) {
        this.config = config;
        this.pendingMintX = config.mintList;
        this.runningMintX = []
        this.commonAltAccounts = []
        this.poolFinderList = poolFinderList
        this.userKeypair = utils.createKeyPairWithConfig(config);
        console.log("userKeypair:", this.userKeypair.publicKey.toString())
        this.connection = connection;
        this.maxRunningMintX = config.mintList.length;

        this.maxIOConcurrent = config.bot.maxIOConcurrent;
        this.skipPreflight = config.bot.skipPreflight;
        this.mintXExpirationTime = 1000 * config.bot.mintXExpirationTime; // 20 minutes
        this.maxSendRate = config.bot.maxSendRate; // x tx/s
        this.maxAmountIn = config.bot.maxInputAmount;
        this.minProfit = config.bot.minProfit;


        const provider = new AnchorProvider(
            this.connection,
            new Wallet(this.userKeypair),
        )
        // 读取当前文件相对路径的json文件 ../idl/arbitrage.json
        const readJsonFileSync = (filePath) => {
            const absolutePath = new URL(filePath, import.meta.url).pathname;
            const fileContent = fs.readFileSync(absolutePath, 'utf8');
            return JSON.parse(fileContent);
        }
        const idl = readJsonFileSync("../idl/idl.json");
        this.program = new Program(
            idl,
            provider);
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
            
            const handler = new MintXHandler(mintX, mintXData, this.connection, true);
            await handler.init();
            await utils.createATATokenAccount(handler.getMintX(), this.connection, this.userKeypair, true);
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

    async transactionConstruct(handler, blockhash) {
        let markets_accounts = []
        let input_alt_accounts = []
        let reverse_flag_list = []
        let type_index_list = []
        await handler.fillAccounts(markets_accounts, 
                                    input_alt_accounts, 
                                    reverse_flag_list, 
                                    type_index_list, 
                                    "SOL", 
                                    ACCOUNT_SIZE, 
                                    true);

        let input_accounts = {
            user: this.userKeypair.publicKey,
            userTokenBase: PublicKey.findProgramAddressSync([
                this.userKeypair.publicKey.toBuffer(),
                TOKEN_PROGRAM_ID.toBuffer(),
                constants.WSOL.toBuffer(),
            ], ASSOCIATED_TOKEN_PROGRAM_ID)[0],
            tokenBaseMint: constants.WSOL,
            tokenProgram: TOKEN_PROGRAM_ID,
            sysProgram: SystemProgram.programId,
            tokenPair0UserTokenAccountX: PublicKey.findProgramAddressSync([
                this.userKeypair.publicKey.toBuffer(),
                TOKEN_PROGRAM_ID.toBuffer(),
                handler.getMintX().toBuffer(),
            ], ASSOCIATED_TOKEN_PROGRAM_ID)[0],
            tokenPair0MintX: handler.getMintX(),
            recipient: constants.RECIPIENT,
        }

        for (let i = 0; i < markets_accounts.length; i++) {
            input_accounts[`account${i}`] = markets_accounts[i];
        }

        for (let i = markets_accounts.length; i < ACCOUNT_SIZE; i++) {
            input_accounts[`account${i}`] = null;
        }

        const arbIx = await this.program.methods
            .arbProcess32Account(
                new BN(this.maxAmountIn),
                new BN(this.minProfit),
                utils.serializeVecU8(type_index_list),
                utils.serializeVecU8(reverse_flag_list)
            )
            .accounts(input_accounts).instruction();

        let arbTx = null;
        {
            const arbInstructions = [
                ComputeBudgetProgram.setComputeUnitLimit({ units: 300000  }), 
                ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 10 }), 
                arbIx
            ];
            const arbMessage = new TransactionMessage({
                payerKey: this.userKeypair.publicKey,
                recentBlockhash: blockhash,
                instructions: arbInstructions,
            })
            arbTx = new VersionedTransaction(arbMessage.compileToV0Message(this.commonAltAccounts));
            arbTx.sign([this.userKeypair]);
        }
        
        return arbTx.serialize()
    }


    // 构造交易并发送
    async transactionConstructorMain() {
        let blockhash = null;
        let blockhashExpire = 0;
        const getLatestBlockhash = async () => {
            if (Date.now() > blockhashExpire) {
                let block_info = await this.connection.getLatestBlockhash("finalized");
                blockhash = block_info.blockhash;
                blockhashExpire = Date.now() + 1000 * 12;
            }
            return blockhash;
        }
        // 限制发送速率
        let lastSendTime = 0;
        const sendLimitWait = async () => {
            while (Date.now() - lastSendTime < 1000 / this.maxSendRate) {
                await new Promise((resolve) => setTimeout(resolve, 0));
            }
            lastSendTime = Date.now();
        }

        while (true) {
            for (let i = 0; i < this.runningMintX.length; i++) {
                const handler = this.runningMintX[i];
                while (this.maxIOConcurrent <= 0) {
                    await new Promise((resolve) => setTimeout(resolve, 50));
                }
                this.maxIOConcurrent -= 1;
                this.transactionConstruct(handler, await getLatestBlockhash()).then(async (arbTransaction) => {
                    try {
                        await sendLimitWait();
                        const signature = await this.connection.sendRawTransaction(arbTransaction, {
                            skipPreflight: this.skipPreflight,
                            preflightCommitment: "processed",
                            maxRetries: 5,
                        })
                        console.log("🚀 ~ swap::signature:", signature);
                    } catch (e) {
                        console.log("🚀 ~ swap::e:", e);
                    }
                    this.maxIOConcurrent += 1;
                }).catch((e) => {
                    console.log("🚀 ~ swap::e:", e);
                    this.maxIOConcurrent += 1;
                })
            }
            // 检测是否过期
            if (this.runningMintX.length > 0) {
                if(this.runningMintX[0].getCreateTime() + this.mintXExpirationTime < Date.now()) {
                    const refreshMintX = this.runningMintX[0].getMintX();
                    this.runningMintX = [
                       ...this.runningMintX.slice(1),
                    ];
                    console.log("runningMintX outdate:", refreshMintX.toString());
                    await this.addMintX(refreshMintX.toString());
                }
            }
            // 尝试让出线程
            await new Promise((resolve) => setTimeout(resolve, 0));
        }
    }

    async addMintX(mintX) {
        this.pendingMintX.push(mintX);
    }

    async init() {
        for (let alt of this.config.address_lookup_tables) {
            const altTable = (await this.connection.getAddressLookupTable(new PublicKey(alt))).value
            this.commonAltAccounts.push(altTable)
        }
    }


    async run() {

        await this.init();
        let promises = [];
        promises.push(utils.GuardForeverRun(async () => {
            await this.processPendingMintXMain();
        }));

        promises.push(utils.GuardForeverRun(async () => {
            await this.transactionConstructorMain();
        }));

        for (let promise of promises) {
            await promise;
        }
    }
}