import * as constants from "./constants.js";
import {
    createAssociatedTokenAccountIdempotentInstruction,
    getAssociatedTokenAddressSync
} from "@solana/spl-token";
import { Connection, 
    Keypair,
    PublicKey, 
    sendAndConfirmTransaction,
    Transaction } from "@solana/web3.js";
import fs from "fs";
import bs58 from "bs58";
export function IsSupportPool(type) {
    if (type == constants.POOLType.kPumpSwap) {
        return true;
    }

    if (type == constants.POOLType.kRaydiumAMM) {
        return true;
    }

    if (type == constants.POOLType.kRaydiumCLMM) {
        return true;
    }

    if (type == constants.POOLType.kMeteoraDLMM) {
        return true;
    }

    if (type == constants.POOLType.kRaydiumCPMM) {
        return true;
    }

    return false;
}

export async function GuardForeverRun(callback, delay = 100) {
    while (true) {
        try {
            await callback();
        } catch (error) {
            console.error("GuardForeverRun Fail , retry", error);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}


let account_cache = new Set();
(() => {
    // load cache
    if (fs.existsSync("./account_cache.json")) {
        const data = fs.readFileSync("./account_cache.json", "utf8");
        const cache = JSON.parse(data);
        account_cache = new Set(cache);
    }
})();
export async function createATATokenAccount(mintx, conn, user, use_cache = true) {
    if (!(mintx instanceof PublicKey)) {
        mintx = new PublicKey(mintx)
    }
    const toAccount = getAssociatedTokenAddressSync(
        mintx,
        user.publicKey,
    );

    if (use_cache && account_cache.has(toAccount.toString())) {
        return;
    }

    const accountInfo = await conn.getAccountInfo(toAccount);
    if (accountInfo) {
        account_cache.add(toAccount.toString())
        return;
    }
    account_cache.add(toAccount.toString())

    const ix = createAssociatedTokenAccountIdempotentInstruction(
        user.publicKey,
        toAccount,
        user.publicKey,
        mintx);
    const instructions = [ix];
    let { blockhash, lastValidBlockHeight } = await conn.getLatestBlockhash("finalized");
    const tx = new Transaction({ blockhash, lastValidBlockHeight, feePayer: user.publicKey, }).add(...instructions);
    const swapTxHash = await sendAndConfirmTransaction(conn, tx, [user])
    console.log(swapTxHash)
    // save cache
    fs.writeFileSync("./account_cache.json", JSON.stringify(Array.from(account_cache)));
}

export function getYAwaysBaseMint(x_info, y_info, x_is_base_mint) {
    if (x_is_base_mint) {
        return [y_info, x_info];
    }
    return [x_info, y_info];
}


export function getBaseMintNameByAddress(base_mint) {
    if (base_mint == constants.WSOL.toString()) {
        return "SOL";
    }

    if (base_mint == constants.USDT.toString()) {
        return "USDT"
    }

    if (base_mint == constants.USDC.toString()) {
        return "USDC"
    }

    return undefined;
}


export function getRandomElements(arr, count) {
    // 复制原数组，避免修改原数组
    const shuffled = [...arr];
    const len = shuffled.length;
    // Fisher-Yates 洗牌算法
    for (let i = len - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    // 取前 count 个元素
    return shuffled.slice(0, count);
}

export function serializeVecU8(list) {
    return Buffer.from(new Uint8Array([...list]))
}

export function createKeyPairWithConfig(config) {
    if (config.base.screctKey.length > 0) {
        return Keypair.fromSecretKey(Uint8Array.from(config.base.screctKey));
    } else {
        // base58 编码的密钥转换为Keypair
        return Keypair.fromSecretKey(bs58.decode(config.base.screctKeyBase58));
    }
}

