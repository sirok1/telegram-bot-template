import express from "express";
import Client from "@/lib/client/client";

export default interface RouteInterface {
    isDisabled: boolean
    get(client: Client, request: express.Request, response: express.Response): Promise<void> | void
    post(client: Client, request: express.Request, response: express.Response): Promise<void> | void
    patch(client: Client, request: express.Request, response: express.Response): Promise<void> | void
    put(client: Client, request: express.Request, response: express.Response): Promise<void> | void
}