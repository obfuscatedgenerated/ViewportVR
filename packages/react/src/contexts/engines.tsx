import { createContext, useContext } from "react";
import type { StorageEngine, MessageEngine, StorageKind } from "@viewportvr/core";

type StorageEngineContextType = Partial<Record<StorageKind, StorageEngine>>;
const StorageEnginesContext = createContext<StorageEngineContextType | null>(null);

export const StorageEnginesProvider = ({ children, value }: { children: React.ReactNode; value: StorageEngineContextType }) => {
    return (
        <StorageEnginesContext.Provider value={value}>
            {children}
        </StorageEnginesContext.Provider>
    );
};
export const useStorageEngines = (): StorageEngineContextType => {
    const context = useContext(StorageEnginesContext);
    if (!context) {
        throw new Error("useStorageEngines must be used within a StorageEnginesProvider");
    }
    return context;
};

export const useStorageEngine = (kind: StorageKind): StorageEngine => {
    const engines = useStorageEngines();
    const engine = engines[kind];
    if (!engine) {
        throw new Error(`Storage engine for kind "${kind}" is not available`);
    }

    return engine;
}

const MessageEngineContext = createContext<MessageEngine | null>(null);

export const MessageEngineProvider = ({ children, value }: { children: React.ReactNode; value: MessageEngine }) => {
    return (
        <MessageEngineContext.Provider value={value}>
            {children}
        </MessageEngineContext.Provider>
    );
};
export const useMessageEngine = (): MessageEngine => {
    const context = useContext(MessageEngineContext);
    if (!context) {
        throw new Error("useMessageEngine must be used within a MessageEngineProvider");
    }
    return context;
};
