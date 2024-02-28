import BaseHandler from "@/lib/handlers/base-handler";
import Client from "@/lib/client/client";
import logger from "@/lib/logger/logger";
import InlineKeyboardInterface from "@/lib/interfaces/inline-keyboard-interface";
import { Context } from "telegraf";

export default class InlineKeyboardHandler extends BaseHandler {
    private readonly client: Client
    fileMap:Map<string, InlineKeyboardInterface> = new Map()

    constructor({inlineKeyboardHandler, client}: { inlineKeyboardHandler: string, client: Client }) {
        super({handlerName: "inline keyboard", handlerFilesDir: inlineKeyboardHandler});
        this.client = client
    }

    public execute() {
        this.client.on("inlineKeyboardCallback", async (context) => {
            let callbackName = context.update.callback_query.data
            let regexpName = /^[^|]*/gm
            let name:string = ""
            let m;
            while ((m = regexpName.exec(callbackName)) !== null) {
                // This is necessary to avoid infinite loops with zero-width matches
                if (m.index === regexpName.lastIndex) {
                    regexpName.lastIndex++;
                }

                // The result can be accessed through the `m`-variable.
                m.forEach((match, groupIndex) => {
                    name = match
                });
            }
            let regexpOptions = /(?<=\|)([\s\S]+?)(?=:\n|$)/gm
            let options:string = ''
            let l
            while ((l = regexpOptions.exec(callbackName)) !== null) {
                if (l.index === regexpOptions.lastIndex) {
                    regexpOptions.lastIndex ++;
                }

                l.forEach((match, groupIndex) => {
                    options = match
                })
            }
            let file = this.fileMap.get(name.toLowerCase())
            const user = await this.client.db?.user.findUnique({
                where: {
                    id: `${context.from.id}`
                }
            })
            if (!file?.isDisabled) {
                if (file?.isAdmin && !user?.isAdmin) return await context.reply("Это действие доступно только администраторам")
                try {
                    file?.callback(context, this.client, options)
                }
                catch (e) {
                    logger.log("error", e)
                }
            }
        })
    }
}