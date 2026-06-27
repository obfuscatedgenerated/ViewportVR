import { Setting, SettingKey, settings } from "@viewportvr/types";



import { StorageEngine } from "./storage";


interface SettingsStorageEngines {
    sync?: StorageEngine<"sync">;
    local?: StorageEngine<"local">;
}

const get_storage_engine = (setting: Setting<any>, storage: SettingsStorageEngines): StorageEngine<"sync"> | StorageEngine<"local"> => {
    if (setting.local_only) {
        if (!storage.local) {
            throw new Error(`Setting ${setting.key} is local only, but no local storage engine was provided`);
        }
        return storage.local;
    } else {
        if (!storage.sync) {
            // TODO: should it gracefully fall back to local and then try to sync if a sync engine is provided in future? will error for now to avoid confusion
            throw new Error(`Setting ${setting.key} is synchronised, but no sync storage engine was provided`);
        }
        return storage.sync;
    }
}

export const get_setting = async <K extends SettingKey>(key: K, storage: SettingsStorageEngines): Promise<typeof settings[K]["default_value"]> => {
    const setting = settings[key];
    const engine = get_storage_engine(setting, storage);

    return await engine.get<typeof setting.default_value>(`settings.${key}`) ?? setting.default_value;
}

export const update_setting = async <K extends SettingKey>(
    key: K,
    value: (typeof settings)[K]["default_value"],
    storage: SettingsStorageEngines
): Promise<void> => {
    const setting = settings[key];
    const engine = get_storage_engine(setting, storage);

    await engine.set<typeof setting.default_value>(`settings.${key}`, value);
};

export const watch_setting = <K extends SettingKey>(
    key: K,
    callback: (new_value: (typeof settings)[K]["default_value"]) => void,
    storage: SettingsStorageEngines
): (() => void) => {
    const setting = settings[key];
    const engine = get_storage_engine(setting, storage);

    return engine.watch<typeof setting.default_value>(
        `settings.${key}`,
        (new_value) => {
            if (new_value === null) {
                callback(setting.default_value);
            } else {
                callback(new_value);
            }
        }
    );
};

// TODO: option to override default
// TODO: can settings types safely move here? altho suppose maybe message defs might need them later
