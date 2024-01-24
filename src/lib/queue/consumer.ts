import amqp from "amqplib";
import EventEmitter from "node:events";
import logger from "@/lib/logger/logger";
import Manager from "@/lib/queue/manager";

interface ConsumerOptions {
    manager: Manager
}

export default class Consumer extends EventEmitter {
    public manager: Manager

    constructor(options: ConsumerOptions) {
        super()
        this.manager = options.manager
    }

    startListening(queueName: string) {
        if (this.manager.channels) {
            const ch = this.manager.channels[0]
            ch.consume(queueName, msg => {
                if (msg === null) return
                this.emit("rabbitMessage", msg, ch)
            }).catch(e => logger.log("error", e.toString()))
        }
    }
}