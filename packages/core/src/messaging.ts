import type { ActionMessage, EventMessage, ReplyMessage } from "@hyperlinkvr/types";

export interface MessageChannel<Tx = ActionMessage, Rx = EventMessage> {
    send(payload: Tx): Promise<void>;

    listen(handler: (payload: Rx) => Promise<void>): () => void;

    on_disconnect(handler: () => void): () => void;

    disconnect(): void;
}

export interface MessageEngine {
    // one off messages
    send<Tx = ActionMessage, Rx = void | ReplyMessage>(action: Tx): Promise<Rx>;

    // returns a function to remove the listener
    listen<Rx = EventMessage>(
        handler: (event: Rx) => Promise<void>
    ): () => void;

    // long-lived connections
    connect<Tx, Rx>(channel_name: string): MessageChannel<Tx, Rx>;

    // returns a function to remove the listener
    on_connect<Tx, Rx>(
        channel_name: string,
        handler: (channel: MessageChannel<Rx, Tx>) => void
    ): () => void;
}
