import {
    Connection,
    Keypair,
    PublicKey,
    SystemProgram,
    Transaction,
    sendAndConfirmTransaction
} from '@solana/web3.js';
import {
    createAssociatedTokenAccountInstruction,
    getAssociatedTokenAddressSync,
    createSyncNativeInstruction,
    createCloseAccountInstruction
} from '@solana/spl-token';
import { globalConfig } from "../config.js";
import fs from 'fs';
import * as utils from "../common/utils.js";
import * as constants from "../common/constants.js";

// 连接到Solana网络
const connection = new Connection(globalConfig.base.rpcUrl)

const wallet = utils.createKeyPairWithConfig(globalConfig);
console.log(`wallet: ${wallet.publicKey.toString()}`);

const convertSolToWsol = async (amount) => {
    // 获取WSOL的关联令牌账户地址
    const associatedTokenAccount = getAssociatedTokenAddressSync(
        constants.WSOL,
        wallet.publicKey
    );

    // 创建交易对象
    const transaction = new Transaction();

    // 如果关联账户不存在，则创建它
    const accountInfo = await connection.getAccountInfo(associatedTokenAccount);
    if (!accountInfo) {
        transaction.add(
            createAssociatedTokenAccountInstruction(
                wallet.publicKey,
                associatedTokenAccount,
                wallet.publicKey,
                constants.WSOL
            )
        );
    }

    // 添加将SOL转换为WSOL的指令
    transaction.add(
        SystemProgram.transfer({
            fromPubkey: wallet.publicKey,
            toPubkey: associatedTokenAccount,
            lamports: amount
        }),
        createSyncNativeInstruction(associatedTokenAccount)
    );

    // 发送并确认交易
    const signature = await sendAndConfirmTransaction(
        connection,
        transaction,
        [wallet]
    );

    console.log('SOL to WSOL Transaction signature:', signature);
};



const convertWsolToSol = async () => {
    // 获取WSOL的关联令牌账户地址
    const associatedTokenAccount = getAssociatedTokenAddressSync(
        constants.WSOL,
        wallet.publicKey
    );

    // 创建交易对象
    const transaction = new Transaction();

    // 添加关闭关联令牌账户的指令，将WSOL转换回SOL
    transaction.add(
        createCloseAccountInstruction(
            associatedTokenAccount,
            wallet.publicKey,
            wallet.publicKey,
            []
        )
    );

    // 发送并确认交易
    const signature = await sendAndConfirmTransaction(
        connection,
        transaction,
        [wallet]
    );

    console.log('WSOL to SOL Transaction signature:', signature);
};

(async () => {
    let amount;
    let wrapSol = true;
    for (let i = 2; i < process.argv.length; i++) {
        const arg = process.argv[i];
        if (arg.startsWith('--amount=')) {
            const value = arg.split('=')[1];
            amount = parseFloat(value);
            if (isNaN(amount)) {
                console.error('错误：amount 参数必须是有效的数字。');
                showUsage();
                process.exit(1);
            }
        } else if (arg === '--close') {
            wrapSol = false;
        } else {
            console.error(`错误：未知参数 ${arg}。`);
            showUsage();
            process.exit(1);
        }
    }

    // 检查是否提供了必要参数
    if (amount === undefined) {
        console.error('错误：必须提供 amount 参数。');
        showUsage();
        process.exit(1);
    } else {
        // console.log(`amount: ${amount}, wrapSol: ${wrapSol}`);
        if (wrapSol) {
            await convertSolToWsol(amount);
        } else {
            await convertWsolToSol();
        }
    }

    // 使用提示函数
    function showUsage() {
        console.log('将sol转换为wsol\n使用方法: node warp_sol.js --amount=<lamport数量> [--close]');
        console.log('  --amount=<数字>  要转换的数量，必须是数字。');
        console.log('  --close       关闭wsol，返还所有sol。');
    }
})();
