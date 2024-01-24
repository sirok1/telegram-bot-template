import BaseHandler from "@/lib/handlers/base-handler";
import Client from "@/lib/client/client";
import KeyboardInteractionInterface from "@/lib/interfaces/command-interaction-interface";
import logger from "@/lib/logger/logger";

export default class KeyboardHandler extends BaseHandler {
    private readonly client: Client
    fileMap: Map<string, KeyboardInteractionInterface> = new Map()

    constructor({keyboardDir, client}: { keyboardDir: string, client: Client }) {
        super({handlerName: "keyboard", handlerFilesDir: keyboardDir});
        this.client = client
        this.client.on("keyboardInteraction", (update) => {
            let interactionName = update[0]
            let ctx = update[1]
            let file = this.fileMap.get(interactionName)
            if (!file || file.isDisabled) ctx.sendMessage("🤨 неизвестная команда")
            if (!file?.isDisabled) {
                try {
                    file?.callback(ctx, this.client)
                } catch (e) {
                    logger.log("error", e)
                }
            }
        })
    }

}