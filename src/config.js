export const globalConfig = {
    "base": {
        // rpc 请求url
        "rpcUrl": "https://api.mainnet-beta.solana.com", 
        // 钱包私钥,32个数字 screctKey和screctKeyBase58 2个填一个即可
        "screctKey": [], 
        // 钱包私钥base58编码字符串 screctKey和screctKeyBase58 2个填一个即可
        "screctKeyBase58": "", 
        // 如果使用防损失合约提交，请填写防损失合约IDL文件路径
        "guardContractIDL": "",
    },
    // 套利机器人配置
    "bot": {
        // 1 wsol, 最大用于购买的wsol数量, 单位lamports, 限制最大输入，实际输入通过套利路径最优计算得到
        "maxInputAmount": 1000000000, 
        // 最小利润, 单位lamports,如果交易最终利润小于该值，交易会报错
        "minProfit": 500, 
        // 最大交易发送数率，每秒发送的最大交易数，用于控制交易发送的速度
        "maxSendRate": 5,
        // 单进程异步并发数量，用于控制异步构造交易的并发数量，主要是异步IO，在js中始终无法超过单线程
        "maxIOConcurrent": 2,
        // 进程并发数量，用于控制进程的并发数量，会启动多个进程
        // "maxProcessConcurrent": 2,

        // 是否跳过仿真，跳过仿真会直接发送交易
        "skipPreflight": false,
        // mint 重新获取pool时间间隔，单位秒
        "mintXExpirationTime": 60 * 20,
    },
    // 需要监听套利的mint列表，自己任意修改，
    // 可以直接去爬gmgn的热榜数据：https://gmgn.ai/?chain=sol&1ren=0&1fr=1&1bu=0&1di=0&0fr=0
    "mintList": [
        "FrYz8JgpmxHFjrd8Lbzr3V8tVT37CKswSxm2yd4qbonk",
        "BY5zKtZW1cd7GJUc7AoqSPkvfeBrUEV4pAL3QabPPUMP",
        "H7xJEp3eCEYozScbZKZoL7kSAXnJV7VEUGkksx6dpump",
        "CYwvrqeCgMY8VhXjXUcHrYLhJWkkXzstY52hrkMypump",
        "7s6TBuZmLfvyqPh8MTJqQSeyxgF6P62QFNn237Lmpump",
        "CEDFLgJUPHMGsAEJUTsZdrVrrAfU7ythx8YrSSzapump",
        "B5boCskXEFb1RJJ9EqJNV3gt5fjhk85DeD7BgbLcpump",
        "GuKMr2mAFh4CFM4Qo2LkU6MKS2fmReTGcmu8GSudgos9",
        "DpySBBrUSyRoSSovFjaoxb9MityQJ9ZYbK9yPWxapump",
        "9AmXAJUk2HKSDAynfhGoJMw22rGNN12oAC2xcjzmpump",
        "A8YHuvQBMAxXoZAZE72FyC8B7jKHo8RJyByXRRffpump",
        "EA6YJYjtaygTdwZsPLZKCFPijDHJtkbgZy4xoJEHpump",
        "9Jc3SotKAograpx8Gw9Rxp6FgwEVvgFZn4me7bSKwjpy",
        "71QXMcNExFJMvGZ88dF5Q6v5f4c36BsdvTrun61mpump",
        "44uYCygv1NrJa8BR9wzmajuV4QHkTCtPEbxpzu7rbonk",
        "cdwmqcpjcqzrvVsKYANCdGkdvGG8H5rpeKVT9YZpump",
        "CfVs3waH2Z9TM397qSkaipTDhA9wWgtt8UchZKfwkYiu",
        "H1pRLTGu9Q3Kv6ziV9DCvTxNQA2vAVocYuGb41wZ1FBk",
        "2NhoUWfCbM8V63aCpqdTk4tpf6AmP1Rq11zJvEWHpump",
        "HcMHyLYQCDBFPYw8HSSVXc3jBdtezb3ADFdTY5Cfpump",
        "8tjDP7xhYBQ8jarFRxGmAghzGXEd3JNW5JATMmFjbonk",
        "3L9KUULbfR8ut1WrQ7FqVQrRVHHhVeFCXxM95fFFpump",
        "Dz9mQ9NzkBcCsuGPFJ3r1bS4wgqKMHBPiVuniW8Mbonk",
        "8gJAaxa5YkrDpXRF6qw1fHW5nxM8sCUkQ9WfXasgpump",
        "AsiNybFogE3LaUpKtmLyK6TWNcfg67QKmAoHvKkMpump",
        "EWst48ttynfMc3qKcw64TwRrKZQBH57R8JMtFUpHpump",
        "DWGxNqh3oQYfZostoCXXdMRaB67WCDYckUjYvsMopump",
        "5MyG7PPYjTHR6PLpFatuRUBUfM4Lp4Lw8bXByDRDpump",
        "GQeJJeQQHcZoaHBEEPMdJNUhwDiJNsXUaANiYA4vpump",
        "9wpLm21ab8ZMVJWH3pHeqgqNJqWos73G8qDRfaEwtray",
        "3fXqh7VDYgK5MCfjRRQkTz2rinm8JgeLtYe2EGjcC7M3",
        "2j9ZhqyA7THxBgkzkmFGUngSLumuw2R9pL18jBF1pump",
        "23cB5pvtxCL1Kj7cSrqAnz35suoTJbCCcryPVUhfAHsa",
        "9RGR9gxTpNNNEY6dq3FghuidY3TFEKAXkTQy6BedsBTc",
        "HtTYHz1Kf3rrQo6AqDLmss7gq5WrkWAaXn3tupUZbonk",
        "4XBoVFNwM4ZsWFGs7mRLeNeKLqRQukHtKy7rewL2vFYa",
        "8KeiNNWuxJ71iLRnBn1VKf6K23EM1AbX4k159zQkbonk",
        "AQQg4MDZUNhportScwoSLKZyg2d59uJNiw7Bp58fbonk",
        "Cr2mM4szbt8286XMn7iTpY5A8S17LbGAu1UyodkyEwn4",
        "8Ma3ZxjVmEeNbARkZCnE3bZXVPn73LvBghY9VFKjpump",
        "J27UYHX5oeaG1YbUGQc8BmJySXDjNWChdGB2Pi2TMDAq",
        "CgZTsf3rNnXsy3YkXmRr988p1Lrv9FpqBpLPWrAbmoon",
        "4ucDUtsj75XehbjBE9qEb8t51gucbZj2ALBVNT5pump",
        "5UUH9RTDiSpq6HKS6bp4NdU9PNJpXRXuiw6ShBTBhgH2",
        "7tPPYTBKrFLKKnoCwijrsfjAYadyp7GpAmSPUbVwbonk",
        "2WtqdJZEkCWcfNLU9Z2JUDiNLsdLecrNhFjyNeXkpump",
        "ENxHDG5mKZtLbTS3Km9LqXJpc9mu5MwgJm5akM3pump",
        "BJrEzqwLgH5YDVWmTkMfFK4MAvzBj5wn4UWzmFVXpump",
        "9wK8yN6iz1ie5kEJkvZCTxyN1x5sTdNfx8yeMY8Ebonk",
        "6a18sNMEuUG6jSgPNdkwuYc8vRHvziYaQ52foNtkk35g",
        "Hbqv4n33tidePXDKrDA7NGt3Jux1trSyxVpsDaWGpump",
        "HUWzPAUYLgAMWbP8MiQctEUDjqgp5dzQDVw61xpA1Xdc",
        "C9g8XAzPxZKf9CmjzTRHBNV9CMapEPqeFx5zsP84axxC",
        "Edc2bNSGody17f56QLDrGHxrH51CJvVXAJyER5vJpump",
        "ENfpbQUM5xAnNP8ecyEQGFJ6KwbuPjMwv7ZjR29cDuAb",
        "HJ2n2a3YK1LTBCRbS932cTtmXw4puhgG8Jb2WcpEpump",
        "Ai3eKAWjzKMV8wRwd41nVP83yqfbAVJykhvJVPxspump",
        "9sgZAUEyUsifAjrzsD74cCeV3dMzdeEswAJAHxoWpump",
        "8ncucXv6U6epZKHPbgaEBcEK399TpHGKCquSt4RnmX4f",
        "D9mendaps8MaMHtLz2w8Duum3FfamPh2yWX5owKZpump",
        "D9rQuzkDfQk8Bnv1hcozM1bV8CzdhTzKNVbD9uMfpump",
        "bd8eZhS9a2jEtzUcVPcgwU7LXWNhTNSwPRJ6QAoDray",
        "AtortPA9SVbkKmdzu5zg4jxgkR4howvPshorA9jYbonk",
        "38PgzpJYu2HkiYvV8qePFakB8tuobPdGm2FFEn7Dpump",
        "8yxD7uSEyEKpJqaSiunworBFzirAsRXKNjD2X1mdbonk",
        "7Tx8qTXSakpfaSFjdztPGQ9n2uyT1eUkYz7gYxxopump",
        "86iokc2n1RvznYCxuaiuyXwjrpev7Xz2cHJ8s6GDr2tx",
        "DEFn3kkkLrYczTZDTeuFQ24tPmMuep1dTuiK46QMu6BX",
        "DzN1qkcRdsxQRFb9yVvz73Fnu6SbD3f5oJgArVdx7Nzc",
        "EKAPifSWFLvUixDKE1JUpB6W4fU6yXS8gqsc2nevmoon",
        "97PVGU2DzFqsAWaYU17ZBqGvQFmkqtdMywYBNPAfy8vy",
        "GNxYv32buvqPS7M2GuXHxSxSN8weEkQiRuD575LXRYvu",
        "5aqodm2qSK4anKPRGvArGDnF7ko7bm1sQdC49sZrpump",
        "4SbneNwM14L7LnFUFCPdBPrSxRoGnxvHjhRBc1dNbonk",
        "FaNghUMLbz7LA8crTEQ7XLK9VSCt9MmyjajdYqVspump",
        "5evN2exivZXJfLaA1KhHfiJKWfwH8znqyH36w1SFz89Y",
        "DX3v7Agdh7R9rWFJsmnNiB7wCtjneBJng9jM9Yk8qZrJ",
        "3qVpCnqdaJtARzE2dYuCy5pm8X2NgF5hx9q9GosPpump",
    ],
    // address_lookup_tables,
    "address_lookup_tables": [
        // 这个alt提供了一些交易池的公共地址（例如Program，authority等），以减少交易的体积, 也可以替换为其他的，支持多个
        "8xXRCZ18hs6dpwkgLMasgRoZStPRPJi2Dg6z54kSiWTE",
    ],
    
}