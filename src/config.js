export const globalConfig = {
    "base": {
        // rpc 请求url
        "rpcUrl": "https://api.mainnet-beta.solana.com", 
        // 钱包私钥 screctKey和screctKeyBase58 2个填一个即可
        "screctKey": [], 
        // 钱包私钥base58 screctKey和screctKeyBase58 2个填一个即可
        "screctKeyBase58": "", 
    },
    // 套利机器人配置
    "bot": {
        // 5 wsol, 最大用于购买的wsol数量, 单位lamports
        "maxInputAmount": 5000000000, 
        "minProfit": 1000, // 最小利润, 单位lamports,如果交易最终利润小于该值，交易会报错
    },
    // 需要监听套利的mint列表
    "mintList": [
        "Dz9mQ9NzkBcCsuGPFJ3r1bS4wgqKMHBPiVuniW8Mbonk",
    ],
    // address_lookup_tables,
    "address_lookup_tables": [
        // 这个alt提供了一些交易池的公共地址（例如Program，authority等），以减少交易的体积, 也可以替换为其他的
        "8xXRCZ18hs6dpwkgLMasgRoZStPRPJi2Dg6z54kSiWTE",
    ],
    
}