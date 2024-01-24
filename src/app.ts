import * as dotenv from "dotenv";
import Client from "@/lib/client/client";
import path from "node:path";
import logger from "@/lib/logger/logger";

dotenv.config()

const client = new Client({})

client.on("ready", async (tgBotInstance) => {
    logger.log("debug", `bot ready at ${client.readyAt}}, bot current uptime: ${client.uptime} ms`)
    logger.log("info", `Ready as ${tgBotInstance.first_name} at https://t.me/${tgBotInstance.username}`)
})


// @ts-ignore
client.login(process.env.TOKEN)