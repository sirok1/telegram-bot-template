import winston from "winston";
import * as dotenv from "dotenv"
import LokiTransport from "winston-loki";

dotenv.config()

export class Logger {
    private logger: winston.Logger;
    private readonly loggerLevels: { [key: string]: number }
    private readonly loggerColors: { [key: string]: string }

    constructor(logs_dir_path: string) {
        this.loggerLevels = {
            error: 0,
            warn: 1,
            info: 2,
            http: 3,
            debug: 5,
            verbose: 6,
            silly: 7
        }
        this.loggerColors = {
            error: 'red',
            warn: 'yellow',
            info: 'green',
            http: 'magenta',
            verbose: 'cyan',
            debug: 'blue',
            silly: 'gray'
        }
        winston.addColors(this.loggerColors)
        this.logger = winston.createLogger({
            level: "info",
            levels: this.loggerLevels,
            format: winston.format.combine(
                winston.format.timestamp(),
                this.formatting()
            ),
            defaultMeta: {service: process.env.NAME},
            transports: [
                new winston.transports.File({filename: `${logs_dir_path}/error.log`, level: "error"}),
                new winston.transports.File({filename: `${logs_dir_path}/combined.log`}),
            ]
        })

        if (process.env.NODE_ENV === "development") {
            this.logger.add(new winston.transports.Console({
                format: winston.format.combine(
                    winston.format.timestamp(),
                    winston.format.colorize(),
                    this.formatting()
                ),
                level: "debug"
            }))
        }
        else {
            this.logger.add(new winston.transports.Console({
                format: winston.format.combine(
                    winston.format.colorize(),
                    this.formatting()
                ),
                level: "info"
            }))
        }
        if (process.env.LOKI_HOST) {
            this.logger.add(
                new LokiTransport({
                    host: `http://${process.env.LOKI_HOST}:3100`,
                    labels: {service: ''}
                })
            )
        }

    }

    private formatting() {
        return winston.format.printf(({level, message, timestamp}) => {
            return `${timestamp} ${level}: ${message}`;
        })
    }

    log(level: string, message: any) {
        this.logger.log({
            level: level,
            message: message,
            labels: {service: String(process.env.NAME)}
        })
    }
}

declare global {
    var logger: Logger | undefined
}

const logger = globalThis.logger || new Logger("logs")
globalThis.logger = logger

export default logger