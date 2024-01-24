import Client from "@/lib/client/client";
import logger from "@/lib/logger/logger";

export default class Middleware {
    private client: Client
    constructor(client:Client) {
        this.client = client
    }
    public register():void {
        this.client.bot?.use((ctx, next) => {
            // @ts-ignore
            if (ctx.update?.message?.text?.startsWith("/")) {
                // @ts-ignore
                this.client.emit("command", [`${ctx.message?.text}`, ctx])
            }
            // @ts-ignore
            if (ctx.update?.callback_query?.id) {
                this.client.emit("inlineKeyboardCallback", ctx)
            }
            // @ts-ignore
            if (ctx.update?.message) {
                let isKeyBoardInteraction = false
                for (let keyboardOption of this.client.keyboardsOptions){
                    // @ts-ignore
                    if (keyboardOption[0] === ctx.update?.message.text){
                        isKeyBoardInteraction = true
                        // @ts-ignore
                        this.client.emit("keyboardInteraction", [keyboardOption[1], ctx])
                        break
                    }
                }
                if (!isKeyBoardInteraction) this.client.emit("messageCreate", ctx)
            }
            next().catch(e => logger.log("error", e))
        })
    }
}