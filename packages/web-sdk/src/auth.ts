import {send} from "./messenger";
import type { Identity } from "@hyperlinkvr/types";

export const query = async (identity: Identity) => {
    return send({action: "HVRSDK_AUTH_QUERY", identity});
}

export const whoami = async () => {
    return send({action: "HVRSDK_AUTH_WHOAMI"});
}

export {parse_identity} from "@hyperlinkvr/auth";
