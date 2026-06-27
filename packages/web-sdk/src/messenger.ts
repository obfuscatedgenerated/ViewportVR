import type {
    WebSDKActionMessage,
    WebSDKReplyMessage,
    WithCorrelation,
} from "@viewportvr/types";

export const send = async (message: WebSDKActionMessage): Promise<WebSDKReplyMessage> => {
    const correlation_id = crypto.randomUUID();
    const message_with_correlation: WithCorrelation<WebSDKActionMessage> = {
        ...message,
        correlation_id
    };

    return new Promise((resolve, reject) => {
        const handle_message = (event: MessageEvent) => {
            const data = event.data as any;
            // TODO: should this check for VVRSDK prefix?
            if ("for" in data && data.for === message.action && "correlation_id" in data && data.correlation_id === correlation_id) {
                window.removeEventListener("message", handle_message);

                const { correlation_id, ...without_correlation } = data;
                resolve(without_correlation);
            }
        };

        window.addEventListener("message", handle_message);
        window.postMessage(message_with_correlation, "*");
    });
}
