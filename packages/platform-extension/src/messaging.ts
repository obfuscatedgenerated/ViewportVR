import browser from "webextension-polyfill";
import type { MessageEngine, MessageChannel } from "@viewportvr/core";

export class ExtensionMessageEngine implements MessageEngine {
    async send<Tx, Rx>(action: Tx): Promise<Rx> {
        return browser.runtime.sendMessage(action);
    }

    listen<Rx>(handler: (event: Rx) => Promise<void> | void): () => void {
        const listener = (message: any) => {
            return handler(message as Rx);
        };

        browser.runtime.onMessage.addListener(listener);
        return () => browser.runtime.onMessage.removeListener(listener);
    }

    connect<Tx, Rx>(channel_name: string): MessageChannel<Tx, Rx> {
        const port = browser.runtime.connect({ name: channel_name });

        return {
            send: async (payload: Tx) => {
                port.postMessage(payload);
            },
            listen: (handler) => {
                const listener = (msg: any) => handler(msg as Rx);
                port.onMessage.addListener(listener);
                return () => port.onMessage.removeListener(listener);
            },
            on_disconnect: (handler) => {
                port.onDisconnect.addListener(handler);
                return () => port.onDisconnect.removeListener(handler);
            },
            disconnect: () => port.disconnect()
        };
    }

    on_connect<Tx, Rx>(
        channel_name: string,
        handler: (channel: MessageChannel<Rx, Tx>) => void
    ): () => void {
        const listener = (port: browser.Runtime.Port) => {
            if (port.name === channel_name) {
                const channel: MessageChannel<Rx, Tx> = {
                    send: async (payload: Rx) => {
                        port.postMessage(payload);
                    },
                    listen: (handler) => {
                        const listener = (msg: any) => handler(msg as Tx);
                        port.onMessage.addListener(listener);
                        return () => port.onMessage.removeListener(listener);
                    },
                    on_disconnect: (handler) => {
                        port.onDisconnect.addListener(handler);
                        return () => port.onDisconnect.removeListener(handler);
                    },
                    disconnect: () => port.disconnect()
                };
                handler(channel);
            }
        };

        browser.runtime.onConnect.addListener(listener);
        return () => browser.runtime.onConnect.removeListener(listener);
    }
}
