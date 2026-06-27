import { WebSDKActionName } from "@viewportvr/types";



import * as auth_handlers from "./auth";
import type { Handler, HandlerData, HandlerMap } from "./types";


export * from "./auth";

const handlers = {
    VVRSDK_AUTH_QUERY: auth_handlers.query,
    VVRSDK_AUTH_WHOAMI: auth_handlers.whoami
} satisfies HandlerMap;

export const handle_web_sdk = <K extends WebSDKActionName>(data: HandlerData<K>) => {
    const { message } = data;
    const handler = handlers[message.action] as unknown as Handler<K>;
    if (!handler) {
        throw new Error(`No handler for action: ${message.action}`);
    }
    return handler(data);
};
