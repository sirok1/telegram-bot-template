import logger from "@/lib/logger/logger";

export default class Cache {
    private cache_map = new Map()

    constructor(clean_timeout: number) {
        setInterval(() => this.clearExpired(clean_timeout), clean_timeout)
    }

    public add(key: string, value: any) {
        logger.log("debug", `Cache > adding new record ${value}`)
        if (this.cache_map.get(key)) {
            this.update(key, value)
        } else this.set(key, value)
    }

    private set(key: string, value: any) {
        let data = Object.assign(value, {lastUpdatedTimestamp: Date.now()})
        return this.cache_map.set(key, data)
    }

    public get(key: string) {
        return this.cache_map.get(key)
    }

    private update(key: string, value: any) {
        value.lastUpdatedTimestamp = Date.now()
        this.cache_map.delete(key)
        this.cache_map.set(key, value)
    }

    private clearExpired(clean_timeout: number) {
        for (let [key, value] of this.cache_map) {
            if (Date.now() - value.lastUpdatedTimestamp > clean_timeout) {
                this.cache_map.delete(key)
            }
        }
    }

    public drop() {
        this.cache_map.clear()
    }
}