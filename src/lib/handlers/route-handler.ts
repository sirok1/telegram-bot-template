import BaseHandler from "@/lib/handlers/base-handler";
import Client from "@/lib/client/client";
import RouteInterface from "@/lib/interfaces/route-interface";
import express from "express";
import logger from "@/lib/logger/logger";

export default class RouteHandler extends BaseHandler {
    private readonly client: Client
    fileMap: Map<string, RouteInterface> = new Map()

    constructor({routesDir, client}: {routesDir: string, client: Client}) {
        super({handlerName: "route", handlerFilesDir: routesDir});
        this.client = client
    }

    public execute() {
        this.client.on("routeEmit", (req: express.Request, res: express.Response) => {
            let name = req.path.substring(1)
            let method = req.method
            let file = this.fileMap.get(name.toLowerCase())
            if (!file?.isDisabled){
                try {
                    switch (method) {
                        case "GET":
                            file?.get(this.client, req, res)
                            break
                        case "POST":
                            file?.get(this.client, req, res)
                            break
                        case "PATCH":
                            file?.get(this.client, req, res)
                            break
                        case "PUT":
                            file?.get(this.client, req, res)
                            break
                    }
                }
                catch (e) {
                    logger.log("error", e)
                }
            }
        })
    }
}