/* eslint-disable no-process-exit */
// yarn hardhat node
// yarn hardhat run scripts/deploy.ts --network localhost
// You need to create file .env-#{network-name} to store info about deploy.

import { FundManager } from "../typechain"
import { parse } from "dotenv"
import { appendFileSync, readFileSync } from "fs"
import hre from "hardhat"
import { FundManager__factory } from "../typechain/factories/contracts"

async function deploy(): Promise<void> {
    const net = hre.network.name
    const config = parse(readFileSync(`.env-${net}`))
    for (const parameter in config) {
        process.env[parameter] = config[parameter]
    }

    const FundManager_factory: FundManager__factory = <FundManager__factory>(
        await hre.ethers.getContractFactory("FundManager")
    )
    const fundManager: FundManager = <FundManager>(
        await FundManager_factory.deploy()
    )
    await fundManager.deployed()

    //Sync env file
    appendFileSync(
        `.env-${net}`,
        `\r\# Deployed at \rCONTRACT_ADDRESS="${fundManager.address}"\r`
    )

    console.log(`Deployed at: ${fundManager.address}`)

}

deploy()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
