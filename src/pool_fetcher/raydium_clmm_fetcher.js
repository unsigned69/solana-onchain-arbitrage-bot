import {
    Connection,
    PublicKey,
    Keypair,
    ComputeBudgetProgram,
    TransactionMessage,
    VersionedTransaction,
  } from "@solana/web3.js";
import { BN } from "bn.js";
import {
    ASSOCIATED_TOKEN_PROGRAM_ID,
    TOKEN_PROGRAM_ID
} from "@solana/spl-token";
import { Fetcher } from "./fetcher.js";

const TICK_ARRAY_SIZE = 60;
const POOL_TICK_ARRAY_BITMAP_SEED = Buffer.from("pool_tick_array_bitmap_extension", "utf8");
const TICK_ARRAY_SEED = Buffer.from("tick_array", "utf8");

export class RaydiumCLMMFetcher extends Fetcher {
    constructor(pool_key, connection) {
        super();
        if (!(pool_key instanceof PublicKey)) {
            this.pool_key = new PublicKey(pool_key)
        } else {
            this.pool_key = pool_key
        }
        this.connection = connection;
        this.clmmProgram = new PublicKey("CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK");
        this.tokenProgram2022 = new PublicKey("TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb");
        this.memoProgram = new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr");
        this.ammConfig = null;

        this.tokenXMintAccount = null;
        this.tokenYMintAccount = null;
        this.tokenXMint = null;
        this.tokenYMint = null;
        this.observationState = null;

        this.exBitMapAccount = null;
        this.tickArrays = null;

        this.fetch_cd = 30000;
        this.last_fetch_time = 0;
    }

    async incrmentFetch() {
        if (Date.now() - this.last_fetch_time > this.fetch_cd) {
            await this.fetch(true);
            this.last_fetch_time = Date.now();
        }
    }

    typeIndex() {
        return 3;
    }

    mintY() {
        return this.tokenYMint;
    }

    poolKey() {
        return this.pool_key;
    }

    async fetch(force = false) {
        if (this.ammConfig == null || force) {
            const account = await this.connection.getAccountInfo(this.pool_key)

            this.ammConfig = new PublicKey(account.data.subarray(9, 9 + 32))
            this.tokenXMint = new PublicKey(account.data.subarray(9 + 32 + 32, 9 + 32 + 32 + 32))
            this.tokenYMint = new PublicKey(account.data.subarray(9 + 32 + 32 + 32, 9 + 32 + 32 + 32 + 32))
            this.tokenXMintAccount = new PublicKey(account.data.subarray(9 + 32 + 32 + 32 + 32, 9 + 32 + 32 + 32 + 32 + 32))
            this.tokenYMintAccount = new PublicKey(account.data.subarray(9 + 32 + 32 + 32 + 32 + 32, 9 + 32 + 32 + 32 + 32 + 32 + 32))
            this.observationState = new PublicKey(account.data.subarray(9 + 32 + 32 + 32 + 32 + 32 + 32, 9 + 32 + 32 + 32 + 32 + 32 + 32 + 32))

            const observationStateOffset = 9 + 32 + 32 + 32 + 32 + 32 + 32 + 32;

            let currentTickArrayStartIndex = null;
            let tickSpacing = null;
            let tickCurrent = null;
            {
                const tickSpacingDataView = new DataView(new Uint8Array(account.data.subarray(observationStateOffset + 2, observationStateOffset + 2 + 2)).buffer)
                tickSpacing = tickSpacingDataView.getUint16(0, true);

                const tickCurrentDataView = new DataView(new Uint8Array(account.data.subarray(observationStateOffset + 2 + 2 + 32, observationStateOffset + 2 + 2 + 32 + 4)).buffer)
                tickCurrent = tickCurrentDataView.getInt32(0, true);

                const ticksInArray = this.tickCount(tickSpacing);

                let startIndex = tickCurrent / ticksInArray;
                if (tickCurrent < 0 && tickCurrent % ticksInArray != 0) {
                startIndex = Math.ceil(startIndex) - 1;
                } else {
                startIndex = Math.floor(startIndex);
                }
                currentTickArrayStartIndex = startIndex * ticksInArray;
            }


            // bitmap
            let tickArrayBitmap = [];
            let positiveTickArrayBitmap = [];
            let negativeTickArrayBitmap = []; 
            {
                const bitmapData = new Uint8Array(account.data.subarray(observationStateOffset + 164 + 507, observationStateOffset + 164 + 507 + 16 * 8))
                for (let i = 0; i < 16 * 8; i+=8) {
                    tickArrayBitmap.push(new BN(bitmapData.slice(i, i + 8), "le"))
                }
                this.exBitMapAccount = PublicKey.findProgramAddressSync([
                    POOL_TICK_ARRAY_BITMAP_SEED,
                    this.pool_key.toBuffer(),
                ], this.clmmProgram)[0]

                const exBitMapAccountData = await this.connection.getAccountInfo(this.exBitMapAccount)
                new PublicKey(exBitMapAccountData.data.subarray(8, 8 + 32)).toString()

                const positiveTickUint8Array = new Uint8Array(exBitMapAccountData.data.subarray(8 + 32, 8 + 32 + (14 * 8 * 8)))
                const negativeTickUint8Array = new Uint8Array(exBitMapAccountData.data.subarray(8 + 32 + (14 * 8 * 8), 8 + 32 + (14 * 8 * 8) * 2))
                for (let i = 0; i < 14; i++) {
                    let positive = []
                    let negative = []
                    for (let j = 0; j < 8; j++) {
                        const pb = new BN(positiveTickUint8Array.slice((i * 8 + j) * 8, (i * 8 + j + 1) * 8), "le");
                        const nb = new BN(negativeTickUint8Array.slice((i * 8 + j) * 8, (i * 8 + j + 1) * 8), "le");
                        positive.push(pb)
                        negative.push(nb)
                    }
                    positiveTickArrayBitmap.push(positive)
                    negativeTickArrayBitmap.push(negative)
                }
            }

            // search
            let startIndexArray = null;
            {
                const tickArrayOffset = Math.floor(currentTickArrayStartIndex / (tickSpacing * TICK_ARRAY_SIZE));
                startIndexArray = [
                ...this.searchLowBit(
                    tickArrayBitmap,
                    positiveTickArrayBitmap,
                    negativeTickArrayBitmap,
                    tickArrayOffset - 1,
                    tickSpacing,
                    1
                ),
                ...this.searchHightBit(
                    tickArrayBitmap,
                    positiveTickArrayBitmap,
                    negativeTickArrayBitmap,
                    tickArrayOffset,
                    tickSpacing,
                    2
                )
                ]
            }
            // tickArrays
            this.tickArrays = [];
            {
                for (let i = 0; i < startIndexArray.length; i++) {
                    const startIndex = startIndexArray[i];
                    this.tickArrays.push(PublicKey.findProgramAddressSync([
                        TICK_ARRAY_SEED,
                        this.pool_key.toBuffer(),
                        this.i32ToBytes(startIndex)
                    ], this.clmmProgram)[0]);
                }
            }
        }
        
    }

    i32ToBytes(num) {
        const arr = new ArrayBuffer(4);
        const view = new DataView(arr);
        view.setInt32(0, num, false);
        return new Uint8Array(arr);
      }

    searchLowBit(
        tickArrayBitmap,
        positiveTickArrayBitmap,
        negativeTickArrayBitmap,
        currentTickArrayBitStartIndex,
        tickSpacing,
        expectedCount,
    ) {
        const tickArrayBitmaps = [
            ...[...negativeTickArrayBitmap].reverse(),
            tickArrayBitmap.slice(0, 8),
            tickArrayBitmap.slice(8, 16),
            ...positiveTickArrayBitmap,
        ].map((bns) => {
            let b = new BN(0);
            for (let i = 0; i < bns.length; i++) {
            b = b.add(bns[i].shln(64 * i));
            }
            return b;
        });
        let result = [];
        while (currentTickArrayBitStartIndex >= -7680) {
            const arrayIndex = Math.floor((currentTickArrayBitStartIndex + 7680) / 512);
            const searchIndex = (currentTickArrayBitStartIndex + 7680) % 512;

            if (tickArrayBitmaps[arrayIndex].testn(searchIndex)) result.push(currentTickArrayBitStartIndex);

            currentTickArrayBitStartIndex--;
            if (result.length === expectedCount) break;
        }
        const tickCount = this.tickCount(tickSpacing);
        return result.map((i) => i * tickCount);
    }

    searchHightBit(
        tickArrayBitmap,
        positiveTickArrayBitmap,
        negativeTickArrayBitmap,
        currentTickArrayBitStartIndex,
        tickSpacing,
        expectedCount,
    ) {
        const tickArrayBitmaps = [
            ...[...negativeTickArrayBitmap].reverse(),
            tickArrayBitmap.slice(0, 8),
            tickArrayBitmap.slice(8, 16),
            ...positiveTickArrayBitmap,
          ].map((bns) => {
            let b = new BN(0);
            for (let i = 0; i < bns.length; i++) {
            b = b.add(bns[i].shln(64 * i));
            }
            return b;
        });
          const result = [];
          while (currentTickArrayBitStartIndex < 7680) {
            const arrayIndex = Math.floor((currentTickArrayBitStartIndex + 7680) / 512);
            const searchIndex = (currentTickArrayBitStartIndex + 7680) % 512;
      
            if (tickArrayBitmaps[arrayIndex].testn(searchIndex)) result.push(currentTickArrayBitStartIndex);
      
            currentTickArrayBitStartIndex++;
            if (result.length === expectedCount) break;
          }
      
          const tickCount = this.tickCount(tickSpacing);
          return result.map((i) => i * tickCount);
    }

    tickCount(tickSpacing) {
        return tickSpacing * TICK_ARRAY_SIZE
    }


    async getFillaccounts() {
        let input_accounts = []
        input_accounts.push(this.clmmProgram);
        input_accounts.push(this.ammConfig);
        input_accounts.push(this.pool_key);
        input_accounts.push(this.tokenXMintAccount);
        input_accounts.push(this.tokenYMintAccount);
        input_accounts.push(this.observationState);
        input_accounts.push(this.tokenProgram2022)
        input_accounts.push(this.memoProgram)
        input_accounts.push(this.exBitMapAccount)

        if (this.tickArrays.length > 3) {
            throw new Error("tickArrays length > 3")
        }
        for (let i = 0; i < this.tickArrays.length; i++) {
            input_accounts.push(this.tickArrays[i])
        }
        for (let i = 0; i < 3 - this.tickArrays.length; i++) {
            input_accounts.push(null)
        }
        
        return input_accounts;
    }
}

// const c = new Connection("https://mainnet.helius-rpc.com/?api-key=e4829446-181d-47e1-a466-b099184296c7")
// // const ray = new RaydiumCLMMFetcher("GQsPr4RJk9AZkkfWHud7v4MtotcxhaYzZHdsPCg9vNvW", c)
// const ray = new RaydiumCLMMFetcher("CebffaLQemzZzFqi9P7gPpZTXMsZQxkcpkTMfEMu9Hqg", c)
// await ray.fetch()
// const fillaccounts = await ray.getFillaccounts()
// fillaccounts.forEach((fillaccount) => {
//     if (fillaccount == null) {
//         console.log("fillaccount: null")
//         return
//     }
//     console.log("fillaccount:", fillaccount.toString())
// })