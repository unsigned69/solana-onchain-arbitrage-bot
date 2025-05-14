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
    createSyncNativeInstruction
} from '@solana/spl-token';
import fs from 'fs';
// 连接到Solana网络
const connection = new Connection('https://mainnet.helius-rpc.com/?api-key=e4829446-181d-47e1-a466-b099184296c7', 'confirmed');

const contract_wallet_path = '/home/touyi/sol/tmp/keys/main_test.json';

function readJsonFileSync(filePath) {
    // 1. 同步读取文件内容
    const rawData = fs.readFileSync(filePath, 'utf-8');

    // 2. 解析 JSON
    const parsedData = JSON.parse(rawData);
    return parsedData;
}

const wallet_secret = readJsonFileSync(contract_wallet_path);


// 你的钱包密钥对
const wallet = Keypair.fromSecretKey(new Uint8Array(wallet_secret));

// SOL的Mint地址
const solMint = new PublicKey('So11111111111111111111111111111111111111112');

const amount = 10000000; // 要转换的SOL数量，以lamports为单位，1 SOL = 10^9 lamports

const convertSolToWsol = async () => {
    // 获取WSOL的关联令牌账户地址
    const associatedTokenAccount = getAssociatedTokenAddressSync(
        solMint,
        wallet.publicKey
    );

    // 创建交易对象
    const transaction = new Transaction();

    // 如果关联令牌账户不存在，则创建它
    const accountInfo = await connection.getAccountInfo(associatedTokenAccount);
    if (!accountInfo) {
        transaction.add(
            createAssociatedTokenAccountInstruction(
                wallet.publicKey,
                associatedTokenAccount,
                wallet.publicKey,
                solMint
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

    console.log('Transaction signature:', signature);
};

convertSolToWsol();