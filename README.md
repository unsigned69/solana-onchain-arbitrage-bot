
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
> 需要保证转换的数量需要大于config.js 配置中的maxInputAmount 配置字段
* ## 启动运行

在src目录下执行：`node main.js`

> **注意**：套利的用户中间代币账户（例如trump）如果不存在，机器人会自动创建，无需手动创建；如果存在，请确保该账户余额为空

# 套利原理

对于任意两个交易池，如果存在价格差，则可能通过套利来获取利润，假设：
  * 在交易池1中使用a个SOL买入b个代币X
  * 在交易池2中使用b个代币X卖出得到c个SOL
  * 可能的利润：p = c - a


如果p大于0，则可以进行套利，否则无法套利

对于多个交易池的套利，需要在交易池中提前计算出最优套利路线，然后按照最优路线进行套利。

限制于合约算力，目前只支持一跳最优路径计算，即：SOL->X->SOL, 合约会对输入的所以交易池两两配对，计算出最优套利的配对路径，然后按照最优路径进行套利。如果所有路径都无法套利，则不会进行套利。并且合约会报错，使得交易失败


# 如何信任？

因为合约代码并不开源，所以让人担心的问题就是：
* 我的私钥会不会被上传？
* 你会不会在合约里面把我的钱全部转走?

为了取得信任，我们从以下几个方面来保证不会出现上述情况：

**对于第一个问题**：客户端代码完全开源，你可以看到客户端代码中，私钥只用于本地签名交易，不会上传发送给任何第三方，也不会被合约读取到。

**对于第二个问题**：套利合约代码并不开源，所以在不加防护的情况下合约拥有者确实可以做到这一点，因此我们开源了一份[防损失合约](https://github.com/touyi/guard_contract)代码仓库，其原理如下：

在套利合约当中，通过客户端代码我们可以看到输入套利合约的用户token账户只包含
* sol账户（signer默认携带）
* wsol账户（userTokenBase）
* 套利的中间代币账户（tokenPair0UserTokenAccountX）

在套利合约当中，只可能做到转移这三个账户的余额。

**“套利的中间代币账户”** 因为需要保证余额为空，所以是没有的。

对于SOL和WSOL，在[防损失合约](https://github.com/touyi/guard_contract)中，会确保套利合约调用后WSOL+SOL的数量一定大于调用前的数量，否则合约失败，整个交易回滚。以此保证不会在套利合约中出现损失。具体实现参考[防损失合约](https://github.com/touyi/guard_contract)代码

## 防损失合约使用
TODO


# 高级用法

TODO

# 后续计划

* jito 发送
* Kamino
* 高热币监控

# 交流群

https://t.me/+t3Gexbnw0rs5NWQ1

# 代码分析

[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/touyi/solana-onchain-arbitrage-bot)



