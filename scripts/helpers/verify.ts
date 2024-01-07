import { run } from "hardhat"

export const verify = async (args: any[]) => {
    console.log("Verifying contract...")
    try {
        await run("verify:verify", {
            address: "0xF8f003eC382D659Fd68B820938361f69099099ea",
            constructorArguments: args,
        })
    } catch (e: any) {
        if (e.message.toLowerCase().includes("already verified")) {
            console.log("Already verified!")
        } else {
            console.log(e)
        }
    }
}
