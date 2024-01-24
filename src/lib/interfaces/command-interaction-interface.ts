import Client from "@/lib/client/client";
import { Context } from "telegraf";

export default interface KeyboardInteractionInterface {
    isDisabled: boolean,

    callback(ctx: Context, client: Client): Promise<void> | void
}