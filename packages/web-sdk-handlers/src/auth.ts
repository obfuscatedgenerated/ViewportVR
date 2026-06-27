import { read_auth_session } from "@viewportvr/auth";
import type { Handler } from "./types";

export const query: Handler<"VVRSDK_AUTH_QUERY"> = async ({ message }) => {
    // TODO: ask the vr host if the person is in the room and who they are, for now this is just a parrot as we dont have much public auth info anyway
    return {
        for: "VVRSDK_AUTH_QUERY",
        info: {
            identity: message.identity,
            avatar_url: undefined
        }
    };
};

export const whoami: Handler<"VVRSDK_AUTH_WHOAMI"> = async ({ storage }) => {
    const auth_session = await read_auth_session(storage.session);
    if (!auth_session) {
        return {
            for: "VVRSDK_AUTH_WHOAMI",
            info: null
        }
    }

    return {
        for: "VVRSDK_AUTH_WHOAMI",
        info: {
            identity: auth_session.identity,
            avatar_url: auth_session.avatar_url,
            authed_at: auth_session.authed_at
        }
    }
}
