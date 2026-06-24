import { MessageEngine, WindowArgumentsStrategy } from "@viewportvr/core";
import {
    ExtensionMessageEngine,
    ExtensionStorage
} from "@viewportvr/platform-extension";
import {
    AuthSessionProvider,
    ContextProviders,
    MessageEngineProvider,
    StorageEnginesContextType,
    StorageEnginesProvider, WindowArgumentsStrategyProvider
} from "@viewportvr/react";
import { URLParamsWindowArgumentsStrategy } from "@viewportvr/platform-browser";

export const DefaultContextProviders = ({
    children,
    messenger,
    storage_engines,
    window_args_strategy
}: {
    children: React.ReactNode;
    messenger?: MessageEngine;
    storage_engines?: StorageEnginesContextType;
    window_args_strategy?: WindowArgumentsStrategy<unknown>;
}) => {
    // TODO: fallback more efficienlty. repvent rerender spam risk
    if (!messenger) {
        messenger = new ExtensionMessageEngine();
    }

    if (!storage_engines) {
        // const local_storage = useMemo(() => new ExtensionStorage("local"), []);
        // const sync_storage = useMemo(() => new ExtensionStorage("sync"), []);
        // const session_storage = useMemo(
        //     () => new ExtensionStorage("session"),
        //     []
        // );
        // storage_engines = useMemo(
        //     () => ({
        //         local: local_storage,
        //         sync: sync_storage,
        //         session: session_storage
        //     }),
        //     [local_storage, sync_storage, session_storage]
        // );

        const local_storage = new ExtensionStorage("local");
        const sync_storage = new ExtensionStorage("sync");
        const session_storage = new ExtensionStorage("session");
        storage_engines = {
            local: local_storage,
            sync: sync_storage,
            session: session_storage
        };
    }

    if (!window_args_strategy) {
        window_args_strategy = new URLParamsWindowArgumentsStrategy();
    }

    return (
        <ContextProviders
            providers={[
                ({ children }) => (
                    <MessageEngineProvider engine={messenger}>
                        {children}
                    </MessageEngineProvider>
                ),
                ({ children }) => (
                    <StorageEnginesProvider engines={storage_engines}>
                        {children}
                    </StorageEnginesProvider>
                ),
                ({ children }) => (
                    <WindowArgumentsStrategyProvider strategy={window_args_strategy}>
                        {children}
                    </WindowArgumentsStrategyProvider>
                ),
                AuthSessionProvider
            ]}>
            {children}
        </ContextProviders>
    );
};
