import type { StorageEngine } from "@viewportvr/core";
import type {
    NamedAction,
    NamedReply,
    WebSDKActionMessage,
    WebSDKActionName,
    WebSDKReplyMessage
} from "@viewportvr/types";

export interface HandlerData<K extends WebSDKActionName> {
    message: NamedAction<K, WebSDKActionMessage>;
    storage: {
        local: StorageEngine<"local">;
        session: StorageEngine<"session">;
        sync: StorageEngine<"sync">;
    };
}

export type Handler<K extends WebSDKActionName> = (
    data: HandlerData<K>
) => Promise<NamedReply<K, WebSDKReplyMessage>>;

export type HandlerMap = {
    [K in WebSDKActionName]: Handler<K>;
};
