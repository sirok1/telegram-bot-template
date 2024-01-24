import Client from "@/lib/client/client";
import { Context } from "telegraf";

export default interface CommandInterface {
    accessRole: string
    isDisabled: boolean

    callback(ctx: Context, client: Client, options: any): Promise<void> | void
}