import { configDotenv } from "dotenv";
import { Telegraf } from "telegraf";
import Cache from "@/lib/cache"
import { Client as RedisClient } from "@/lib/redis/client";
import EventEmitter from "node:events";
import Middleware from "@/lib/middleware";
import CommandsHandler from "@/lib/handlers/input/commands-handler";
import EventsHandler from "@/lib/handlers/events-handler";
import KeyboardHandler from "@/lib/handlers/input/keyboard-handler";
import InlineKeyboardHandler from "@/lib/handlers/input/inline-keyboard-handler";
import { checkPath } from "@/lib/util";
import Manager from "@/lib/queue/manager";
import Producer from "@/lib/queue/producer";
import Consumer from "@/lib/queue/consumer";
import {PrismaClient} from "@prisma/client"
import logger from "@/lib/logger/logger";

configDotenv()

export type ClientOption = {
    cleanCacheTimeout?: number,
    commandsDir?: string,
    inlineKeyboardsDir?: string,
    eventsDir?: string,
    keyboardInteractionsDir?: string,
    keyboards?: { [key: string]: any[] }
    redis?: boolean,
    admins?: string[],
    rabbitmq?: {
        username: string,
        password: string,
        host: string,
        port: number
    },
    db?: boolean
}

export default class Client extends EventEmitter {
    public bot: Telegraf | undefined
    public READY: boolean = false
    public token: string = ""
    public userCache: Cache
    readonly commandsDir: string | null = null
    readonly inlineKeyboardsDir: string | null = null
    readonly eventsDir: string | null = null
    readonly keyboardInteractionsDir: string | null = null
    public readyAt: Date | null = null
    public redis: RedisClient | undefined
    public keyboards: { [key: string]: any[] } = {}
    public keyboardsOptions: [string[]?] = []
    public middleware: Middleware | undefined
    public commandHandler: CommandsHandler | undefined
    public eventsHandler: EventsHandler | undefined
    public keyboardHandler: KeyboardHandler | undefined
    public inlineKeyboardHandler: InlineKeyboardHandler | undefined
    public admins: string[] | undefined
    public queue: {
        manager: Manager | null,
        producer: Producer | null,
        consumer: Consumer | null
    } = {manager: null, producer: null, consumer: null}
    private dbEnabled: boolean = false
    public db: PrismaClient|undefined

    constructor(options: ClientOption) {
        super();
        if (options.redis) {
            this.redis = new RedisClient({
                host: process.env.REDIS_HOST ?? "",
                port: Number(process.env.REDIS_PORT ?? 6379),
                dbNumber: Number(process.env.REDIS_DB_NUMB ?? 0),
                password: process.env.REDIS_PASS ?? ""
            })
        }
        this.commandsDir = options.commandsDir? checkPath(`${options.commandsDir}`, "directory", "commandsDir") : null
        this.eventsDir = options.eventsDir? checkPath(`${options.eventsDir}`, "directory", "eventsDir") : null
        this.inlineKeyboardsDir = options.inlineKeyboardsDir? checkPath(`${options.inlineKeyboardsDir}`, "directory", "inlineKeyboardsDir") : null
        this.keyboardInteractionsDir = options.keyboardInteractionsDir? checkPath(`${options.keyboardInteractionsDir}`, "directory", "keyboardInteractionsDir") : null
        this.keyboards = options.keyboards ?? {}
        for (let keyboard of Object.entries(this.keyboards)) {
            for (let keyboardOption of keyboard[1].flat(2)) {
                this.keyboardsOptions.push([keyboardOption.text, keyboardOption.callback])
            }
        }
        this.userCache = new Cache(options.cleanCacheTimeout ?? 20 * 60 * 1000)
        this.admins = options.admins
        if (options.rabbitmq) {
            this.queue.manager = new Manager({
                host: options.rabbitmq.host,
                port: options.rabbitmq.port,
                password: options.rabbitmq.password,
                username: options.rabbitmq.username,
                queues: ["simple-group-bot"]
            })
            this.queue.producer = new Producer({manager: this.queue.manager})
            this.queue.consumer = new Consumer({manager: this.queue.manager})
        }
        if (options.db) this.dbEnabled = true
    }

    public isReady(): boolean {
        return this.READY
    }

    private ready(tgBotInfo: any) {
        this.READY = true
        this.readyAt = new Date()
        // if (process.env.NODE_ENV === "production") process!.send("ready")
        this.emit("ready", tgBotInfo)
    }

    public get uptime() {
        return this.readyAt ? Date.now() - Math.floor(this.readyAt.getTime() / 1000) : null
    }

    public get readyTimestamp() {
        return this.readyAt ? Math.floor(this.readyAt?.getTime() / 1000) : null
    }

    private handleExit() {
        process.once("SIGINT", async () => {
            this.bot?.stop("SIGINT")
            await this.redis?.killConnection()
            await this.queue.manager?.connection?.close()
        })
        process.once("SIGTERM", async () => {
            this.bot?.stop("SIGTERM")
            await this.redis?.killConnection()
            await this.queue.manager?.connection?.close()
        })
    }

    private async initRedis(): Promise<boolean> {
        await this.redis?.init()
        return true
    }

    private async initQueue(){
        await this.queue.manager?.connect()
        return true
    }

    private startConsume(){
        this.queue.consumer?.startListening("simple-group-bot")
    }
    private registerMiddleware(): void {
        this.middleware = new Middleware(this)
        this.middleware.register()
    }

    private async registerHandlers(): Promise<string> {
        return new Promise(async (resolve, reject) => {
            if (this.commandsDir) this.commandHandler = new CommandsHandler({
                commandsDir: this.commandsDir,
                client: this
            })
            if (this.inlineKeyboardsDir) this.inlineKeyboardHandler = new InlineKeyboardHandler({
                inlineKeyboardHandler: this.inlineKeyboardsDir,
                client: this
            })
            if (this.eventsDir) this.eventsHandler = new EventsHandler({
                eventsDir: this.eventsDir,
                client: this
            })
            if (this.keyboardInteractionsDir) this.keyboardHandler = new KeyboardHandler({
                keyboardDir: this.keyboardInteractionsDir,
                client: this
            })
            try {
                await this.commandHandler?.getHandlerFiles().catch(console.error)
                await this.inlineKeyboardHandler?.getHandlerFiles().catch(console.error)
                await this.keyboardHandler?.getHandlerFiles().catch(console.error)
                await this.eventsHandler?.getHandlerFiles().catch(console.error)
                resolve('done')
            } catch (e) {
                // @ts-ignore
                reject(e.toString())
            }
        })
    }

    public brunchUpdates() {
        this.commandHandler?.execute()
        this.inlineKeyboardHandler?.execute()
        this.keyboardHandler?.execute()
        this.eventsHandler?.register()
    }

    public login(token: string): void {
        this.token = token
        this.bot = new Telegraf(token)
        this.bot.launch()
            .catch(e => {
                throw new Error(e)
            })
        this.bot.telegram.getMe()
            .then((tgBotInfo) => {
                this.initRedis().catch(e => {
                    throw new Error(e)
                })
                    .then(() => {
                        this.initQueue().catch(e => {
                            throw new Error(e)
                        })
                            .then(() => {
                                this.db = this.dbEnabled? new PrismaClient() : undefined
                                logger.log("info", "DB is ready")
                                this.registerHandlers().then(() => {
                                    this.registerMiddleware()
                                    this.brunchUpdates()
                                    this.startConsume()
                                    this.ready(tgBotInfo)
                                    this.handleExit()
                                })
                            })

                    })

            })
            .catch(e => {
                throw new Error(e)
            })
    }
}