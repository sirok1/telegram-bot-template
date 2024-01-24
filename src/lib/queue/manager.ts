import amqp from "amqplib";
import logger from "@/lib/logger/logger";

interface ManagerOptions {
    host: string,
    port: number,
    username: string,
    password: string,
    queues: string[]
}

export default class Manager {
    public queues: string[] = []
    private readonly connectionString: string = ""
    connection: amqp.Connection | null = null
    channels: amqp.Channel[] = []

    constructor(options: ManagerOptions) {
        this.connectionString = `amqp://${options.username}:${options.password}@${options.host}:${options.port}`
        this.queues = options.queues
    }

    public async connect() {
        return new Promise(async (resolve, reject) => {
            this.connection = await amqp.connect(this.connectionString)
            let channel = await this.connection.createChannel()
            if (!channel) reject("Manager can't create channel")
            this.channels?.push(channel)
            if (this.channels) {
                for (let queue of this.queues) {
                    await this.channels[0].assertQueue(queue)
                }
                logger.log("info", "RabbitMQ is ready")
                resolve("rabbit ready")
            }
            else {
                reject("Manager can't create channel")
            }
        })
    }
}