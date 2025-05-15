
# solana-onchain-arbitrage-bot

支持智能路由，计算最优套利路线
solana onchain arbitrage bot, supports intelligent routing and calculates optimal arbitrage routes

# 基本介绍

本仓库是基于合约智能路由的套利机器人，分为客户端和合约端，本仓库是客户端，主要功能：

* 获取需要套利的交易池
* 自动配对交易池，并且组建交易提交

对于合约端（合约地址：DxeQQ7PQ94j26ism5ivTqNHAkteFNmgRpqYx7XQFqs9Z）

* 接收客户端提交的交易池
* 自动计算最优套利路径以及最优输入（如有），并发起套利操作，否则交易返回失败

目前已经支持的交易池，后续会持续新增

* PumpSwap
* Raydium AMM
* Raydium CPMM
* Raydium CLMM
* Meteora DLMM
* Meteora Dynamic Pools

> **使用本套利机器人对于成功套利的交易，收取利润的10%作为手续费，如果套利失败，或者无利润，本合约不收取任何手续费。**
> 例如套利 输入0.5 sol，输出0.6 sol，利润就是0.1sol，手续费为0.1 * 10% = 0.01 sol

# 快速开始

* ## 安装环境

> 目前只支持一键linux系统安装

根目录执行：

```
bash install.sh
```

* ## 基本配置

solana-onchain-arbitrage-bot/src/config.js
config.js 中的一下配置必须填写，screctKey和screctKeyBase58填写一个即可

```
"base": {
        // rpc 请求url
        "rpcUrl": "https://api.mainnet-beta.solana.com", 
        // 钱包私钥,32个数字 screctKey和screctKeyBase58 2个填一个即可
        "screctKey": [], 
        // 钱包私钥base58编码字符串 screctKey和screctKeyBase58 2个填一个即可
        "screctKeyBase58": "", 
    },
```

* ## 转换wsol

dex一般都是直接使用wsol来交易，所以在启动交易的时候需要先在账户中转换好等量的wsol，使用仓库中提供的脚本进行转换：
在src/tools目录下执行：`node warp_sol.js --amount=1000000000`
其中amount是lamport单位的sol数量
当需要关闭wsol退回sol是执行`node warp_sol.js --amount=1000000000 --close`

* ## 启动运行

在src目录下执行：`node main.js`

# 套利原理

TODO

# 灵活使用套利合约

TODO

# 后续计划

* jito 发送
* Kamino

# 交流群

https://t.me/+t3Gexbnw0rs5NWQ1

[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/touyi/solana-onchain-arbitrage-bot)



