export const globalConfig = {
    "base": {
        // rpc 请求url
        "rpcUrl": "https://api.mainnet-beta.solana.com", 
        // 钱包私钥,32个数字 screctKey和screctKeyBase58 2个填一个即可
        "screctKey": [], 
        // 钱包私钥base58编码字符串 screctKey和screctKeyBase58 2个填一个即可
        "screctKeyBase58": "", 
    },
    // 套利机器人配置
    "bot": {
        // 1 wsol, 最大用于购买的wsol数量, 单位lamports
        "maxInputAmount": 1000000000, 
        // 最小利润, 单位lamports,如果交易最终利润小于该值，交易会报错
        "minProfit": 1000, 
        // 最大交易发送数率，每秒发送的最大交易数，用于控制交易发送的速度
        "maxSendRate": 10,
        // 单进程异步并发数量，用于控制异步构造交易的并发数量，主要是异步IO，在js中始终无法超过单线程
        "maxIOConcurrent": 2,
        // 进程并发数量，用于控制进程的并发数量，会启动多个进程
        // "maxProcessConcurrent": 2,

        // 是否跳过仿真，跳过仿真会直接发送交易
        "skipPreflight": false,
        // mint 重新获取pool时间间隔，单位秒
        "mintXExpirationTime": 60 * 20,
    },
    // 需要监听套利的mint列表
    "mintList": [
        "Dz9mQ9NzkBcCsuGPFJ3r1bS4wgqKMHBPiVuniW8Mbonk",
        // TODO(touyi): 默认的list多来点
    ],
    // address_lookup_tables,
    "address_lookup_tables": [
        // 这个alt提供了一些交易池的公共地址（例如Program，authority等），以减少交易的体积, 也可以替换为其他的，支持多个
        "8xXRCZ18hs6dpwkgLMasgRoZStPRPJi2Dg6z54kSiWTE",
    ],
    
}