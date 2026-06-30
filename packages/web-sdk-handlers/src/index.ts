import { WebSDKActionName } from "@hyperlinkvr/types";



import * as auth_handlers from "./auth";
import type { Handler, HandlerData, HandlerMap } from "./types";


export * from "./auth";

const handlers = {
    HVRSDK_AUTH_QUERY: auth_handlers.query,
    HVRSDK_AUTH_WHOAMI: auth_handlers.whoami
} satisfies HandlerMap;

export const handle_web_sdk = <K extends WebSDKActionName>(data: HandlerData<K>) => {
    const { message } = data;
    const handler = handlers[message.action] as unknown as Handler<K>;
    if (!handler) {
        throw new Error(`No handler for action: ${message.action}`);
    }
    return handler(data);
};
