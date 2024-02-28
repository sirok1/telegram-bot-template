import express from "express"
import cors from "cors"
import logger from "@/lib/logger/logger"
import Client from "@/lib/client/client";

export default class Server {
    public router = express.Router()
    private port = 8000
    private app:express.Application = express()
    private client: Client
    constructor(client:Client) {
        this.client = client
    }
    public init() {
        let time = performance.now()
        this.app.use(express.json())
        this.app.use(cors())
        this.router.all('*', (req, res, next) => {
            this.client.emit("routeEmit", req, res)
            next()
        })
        this.app.use(this.router)
        this.app.listen(this.port, () => {
            logger.log("debug", `Rest server is ready for ${(performance.now() - time).toFixed(2)}`)
            logger.log("info", `Rest server is listening on http://localhost:${this.port}}`)
        })
    }
}