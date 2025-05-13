import * as constants from "./constants.js";
import {
    createAssociatedTokenAccountIdempotentInstruction,
    getAssociatedTokenAddressSync
} from "@solana/spl-token";
import { Connection, 
    PublicKey, 
    sendAndConfirmTransaction,
    Transaction } from "@solana/web3.js";

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


let account_cache = new Set()
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
}
