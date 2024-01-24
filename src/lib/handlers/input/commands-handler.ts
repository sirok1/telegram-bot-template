import BaseHandler from "@/lib/handlers/base-handler";
import Client from "@/lib/client/client";
import logger from "@/lib/logger/logger";
import CommandInterface from "@/lib/interfaces/command-interface";

export default class CommandsHandler extends BaseHandler {
    private readonly client: Client
    fileMap:Map<string, CommandInterface> = new Map()

    constructor({commandsDir, client}: { commandsDir: string, client: Client }) {
        super({handlerName: "command", handlerFilesDir: commandsDir});
        this.client = client
    }

    public async getHandlerFiles(): Promise<void> {
        await super.getHandlerFiles();
    }

    public execute() {
        this.client.on("command", command => {
            let commandName = command[0].substring(1)
            commandName = commandName.toLowerCase()
            let regExp = /^\S*/gm
            let options = {
                messageArgs: commandName.replace(regExp, "").split(" "),
            }
            options.messageArgs.splice(0, 1)
            commandName = commandName.match(regExp)[0]
            let file = this.fileMap.get(commandName)
            if (!file || file.isDisabled) return command[1].reply("🤨 неизвестная команда")
            if (!file.isDisabled) {
                try {
                    file.callback(command[1], this.client, options)
                } catch (e) {
                    logger.log("error", e)
                }
            }
        })
    }
}