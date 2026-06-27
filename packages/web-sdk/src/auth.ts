import {send} from "./messenger";
import type { Identity } from "@viewportvr/types";

export const query = async (identity: Identity) => {
    return send({action: "VVRSDK_AUTH_QUERY", identity});
}

export const whoami = async () => {
    return send({action: "VVRSDK_AUTH_WHOAMI"});
}

export {parse_identity} from "@viewportvr/auth";
