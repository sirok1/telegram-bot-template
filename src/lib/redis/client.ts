import { createClient } from "redis"
import logger from "@/lib/logger/logger";

export class Client {
    public manager: ReturnType<typeof createClient>;
    private readonly jobKey: string

    constructor({host, port, dbNumber, password}: {
        host: string,
        port: number,
        dbNumber: number,
        password: string,
    }) {
        this.jobKey = "jobs"
        this.manager = createClient({
            username: 'default',
            password: password,
            database: dbNumber,
            socket: {
                host: host,
                port: port
            }
        })
        this.manager.on("reconnecting", () => {
            logger.log("warn", 'Redis > reconnecting...')
        })
        this.manager.on("connecting", () => {
            logger.log("debug", "Redis > connecting...")
        })
        this.manager.on("ready", () => {
            logger.log("info", "Redis is ready")
        })
        this.manager.on("error", (e) => {
            logger.log("error", `Redis > ${e}`)
        })
    }

    public async init() {
        await this.manager.connect()
    }

    public async add(key: string, value: object) {
        if (await this.manager.get(`${key}`)) {
            this.update(`${key}`, value)
        } else this.set(`${key}`, value)
    }

    private set(key: string, value: object) {
        let data: object & {
            lastUpdatedTimestamp: number
        } | string = Object.assign(value, {lastUpdatedTimestamp: Date.now()})
        data = JSON.stringify(data)
        return this.manager.set(key, data)
    }

    //todo доделать редис

    private update(key: string, value: object & { lastUpdatedTimestamp: number } | object) {
        let data
        if (key === 'permanent' || key === '') {
            data = JSON.stringify(value)
        } else {
            if ("lastUpdatedTimestamp" in value) {
                value.lastUpdatedTimestamp = Date.now()
                data = value
            } else {
                data = Object.assign({}, value, {lastUpdatedTimestamp: Date.now()})
            }
        }
        data = JSON.stringify(data)
        this.manager.del(`${key}`)
        this.manager.set(`${key}`, data)
    }

    public async get(key: string) {
        let data = await this.manager.get(`${key}`)
        return data ? JSON.parse(data) : null
    }

    // private clearExpiredSessions(clear_timeout: number) {
    //     this.manager.keys('*').then((keys) => {
    //         for (let key of keys) {
    //             console.log(key)
    //             this.manager.get(key)
    //                 .then((objString) => {
    //                     if (objString) {
    //                         let data = JSON.parse(objString)
    //                         if ((Date.now() - Number(data.lastUpdatedTimestamp)) > clear_timeout) {
    //                             this.manager.del(key)
    //                             logger.log("debug", `Redis > the expired record with key ${key} has been deleted`)
    //                         }
    //                     }
    //                 })
    //         }
    //     })
    // }

    public async killConnection() {
        await this.manager.disconnect()
    }

}