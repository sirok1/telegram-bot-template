import BaseHandler from "@/lib/handlers/base-handler";
import Client from "@/lib/client/client";
import logger from "@/lib/logger/logger";

export default class EventsHandler extends BaseHandler {
    private readonly client: Client

    constructor({eventsDir, client}: { eventsDir: string, client: Client }) {
        super({handlerName: "event", handlerFilesDir: eventsDir});
        this.client = client
    }

    public async getHandlerFiles() {
        await super.getHandlerFiles();
    }

    public register() {
        let amount: number = 0
        let bigTime = performance.now()
        if (this.fileArr?.length > 0) {
            for (let event of this.fileArr) {
                if (typeof event.script !== "function") return
                let time = performance.now()
                event.script(this.client)
                time = performance.now() - time
                logger.log("debug", `Event "${event.name}" successfully loaded for ${time.toFixed(3)}ms`)
                amount++
            }
            bigTime = performance.now() - bigTime
            logger.log("info", `successfully loaded ${amount} events for ${bigTime.toFixed(3)}ms`)
        }
    }
}