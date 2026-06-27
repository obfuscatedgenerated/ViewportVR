import { WindowArguments } from "@viewportvr/types";

export interface WindowArgumentsStrategy<S> {
    retrieve(): S;

    serialise(args: WindowArguments): S;
    deserialise(serialised: S): WindowArguments;
}
