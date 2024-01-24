import { getAllFiles } from "@/lib/util";
import logger from "@/lib/logger/logger";
import CommandInterface from "@/lib/interfaces/command-interface";
import InlineKeyboardInterface from "@/lib/interfaces/inline-keyboard-interface";
import KeyboardInteractionInterface from "@/lib/interfaces/command-interaction-interface";

export default class BaseHandler {
    public fileArr: { name: string, script: Function }[] = []
    public fileMap: Map<string, CommandInterface|InlineKeyboardInterface|KeyboardInteractionInterface> = new Map()
    readonly handlerFilesDir: string = ""
    private readonly handlerName: string = "base handler"

    constructor({handlerFilesDir, handlerName}: {
        handlerFilesDir: string,
        handlerName?: string
    }) {
        this.handlerFilesDir = handlerFilesDir
        if (handlerName) {
            this.handlerName = handlerName
        }
    }

    public async getHandlerFiles() {
        let amount: number = 0
        let startTime: number = Date.now()
        let files = getAllFiles(this.handlerFilesDir)
        for (let file of files) {
            let start: number = Date.now()
            let script = await import(file.path)
            this.fileArr.push({name: file.name.toLowerCase(), script: script.default})
            this.fileMap.set(file.name.toLowerCase(), script.default)
            let end: number = Date.now()
            logger.log("debug", `${this.handlerName} file "${file.name}" loaded for ${(end - start).toFixed(2)}ms`)
            amount++
        }
        let endTime: number = Date.now()
        logger.log("info", `successfully loaded ${amount} ${this.handlerName} files for ${(endTime - startTime).toFixed(2)}ms`)
    }

    public register(): void {
        logger.log("debug", `${this.handlerName} > register not implemented`)
    }

    public execute(): void {
        logger.log("debug", `${this.handlerName} > execute not implemented`)
    }
}