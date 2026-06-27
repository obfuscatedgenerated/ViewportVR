import { defineContentScript } from "#imports";

import { URL_PATTERNS } from "~/util/url_patterns";

import type {WebSDKActionMessage, WebSDKReplyMessage, MaybeWithCorrelation, WithCorrelation} from "@viewportvr/types";

export default defineContentScript({
    matches: URL_PATTERNS,
    main() {
        window.addEventListener("message", (event) => {
            if (!("data" in event) || !event.data || typeof event.data !== "object") {
                return;
            }

            const sdk_message = {...event.data} as MaybeWithCorrelation<WebSDKActionMessage>;

            // only forward sdk messages
            if (sdk_message && sdk_message.action && sdk_message.action.startsWith("VVRSDK_")) {
                let correlation_id: string | undefined = undefined;
                if ("correlation_id" in sdk_message) {
                    correlation_id = sdk_message.correlation_id;
                    delete sdk_message.correlation_id;
                }

                chrome.runtime.sendMessage(sdk_message, (response) => {
                    if (response && correlation_id) {
                        const response_with_correlation: WithCorrelation<WebSDKReplyMessage> = {
                            ...response,
                            correlation_id
                        };
                        window.postMessage(response_with_correlation, "*");
                    }
                });
            }
        });
    }
});
