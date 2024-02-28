import Client from "@/lib/client/client";
import { Context } from "telegraf";

export default interface InlineKeyboardInterface {
    isDisabled: boolean,
    isAdmin: boolean

    callback(ctx: Context, client: Client, options: string): Promise<void> | void
}