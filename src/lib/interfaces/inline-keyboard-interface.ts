import Client from "@/lib/client/client";
import { Context } from "telegraf";

export default interface InlineKeyboardInterface {
    isDisabled: boolean

    callback(ctx: Context, client: Client, options: string): Promise<void> | void
}