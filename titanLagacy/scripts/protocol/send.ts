import { sendForceWithdraw } from "./forceWithdraw"

const main = async() => {
    await sendForceWithdraw(10)
}
main()