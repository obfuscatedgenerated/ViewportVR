import type { StorageEngine, StorageKind } from "@viewportvr/core";
import { useEffect, useState } from "react";

import { useStorageEngine } from "../contexts";

export const useStorage = <T>(
    kind: StorageKind,
    key: string,
    default_value: T
): [T, (new_value: T) => Promise<void>] => {
    const engine = useStorageEngine(kind);
    return useStorageFromEngine<T>(engine, key, default_value);
};

export const useStorageFromEngine = <T>(
    engine: StorageEngine,
    key: string,
    default_value: T
): [T, (new_value: T) => Promise<void>] => {
    const [value, setValue] = useState<T>(default_value);

    // set initial value from storage if present
    useEffect(() => {
        engine.get<T>(key).then((val) => {
            if (val !== null) setValue(val);
        });
    }, [engine, key]);

    // watch for changes in storage and update state accordingly
    useEffect(() => {
        const unwatch = engine.watch<T>(key, (new_value) => {
            if (new_value === null) {
                setValue(default_value);
            } else {
                setValue(new_value);
            }
        });
        return () => unwatch();
    }, [engine, key]);

    // setter
    const setStorageValue = async (newValue: T) => {
        setValue(newValue);
        await engine.set<T>(key, newValue);
    };

    return [value, setStorageValue] as const;
};
