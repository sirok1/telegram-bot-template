import amqp from "amqplib"
import logger from "@/lib/logger/logger";
import Manager from "@/lib/queue/manager";

interface ProducerOptions {
    manager: Manager
}

export default class Producer {
    public manager: Manager

    constructor(options: ProducerOptions) {
        this.manager = options.manager
    }

    public send(queueName: string, message: string) {
        let validData = JSON.stringify(message)
        if (this.manager.channels) {
            this.manager.channels[0].sendToQueue(queueName, Buffer.from(validData))
            logger.log("debug", `SENT > ${validData}`)
        } else {
            logger.log("error", "RabbitMQ > Channel does not exist")
        }
    }
}