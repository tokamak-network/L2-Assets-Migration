import { upgradeL1bridge,sendForceWithdraw } from "./forceWithdraw"

const main = async() => {
    await upgradeL1bridge(false)
    await sendForceWithdraw(10,false)
}
main()