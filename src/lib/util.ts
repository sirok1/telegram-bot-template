import * as fs from "fs";
import logger from "@/lib/logger/logger";
import * as Path from "path";
import { BotTypeError } from "@/lib/errors/bot-error";

/**
 * Get files to an Array
 * @param dir The path to the folder whose files you want to get
 */
export function getAllFiles(dir: string) {
    let files: any[] = []
    try {
        files = fs.readdirSync(dir, {
            withFileTypes: true
        })
    } catch (e) {
        logger.log("error", `${e}`)
    }
    let codeFiles: any[] = []
    if (files.length > 0) {
        for (const file of files) {
            if (file.isDirectory()) {
                codeFiles = [...codeFiles, ...getAllFiles(`${dir}/${file.name}`)]
            } else if (file.name.endsWith(".js") || file.name.endsWith(".ts") && !file.name.startsWith("!")) {
                let filename = file.name.replace(/\\/g, '/').split("/")
                filename = filename[filename.length - 1]
                filename = filename.split(".")[0].toLowerCase()
                codeFiles.push({name: filename, path: `${dir}/${file.name}`})
            }
        }
        return codeFiles
    } else return []
}


/**
 * Makes simple error
 * @param err
 */
export function makeSimpleError(err: Error) {
    const {name, message, stack} = err
    return {
        name,
        message,
        stack
    }
}


/**
 * Checks if path is ok
 * @param path
 * @param type
 * @param name
 */
export function checkPath(path: string, type: "file" | "directory", name: string) {
    if (!path) return null
    const stats = fs.statSync(path)
    const res = Path.isAbsolute(path) ? path : Path.resolve(process.cwd(), path)
    switch (type) {
        case "file":
            if (!stats.isFile()) throw new BotTypeError("INVALID_OPTION", `${name}`, "file")
            return res
        case "directory":
            if (!stats.isDirectory()) throw new BotTypeError("INVALID_OPTION", `${name}`, "directory")
            return res
        default:
            throw new BotTypeError("INVALID_OPTION", `${name}`, "file or directory")
    }
}


/**
 * Shallow-copies an object with its class/prototype intact.
 * @param obj
 */
export function cloneObject(obj: object) {
    return Object.assign(Object.create(obj), obj)
}