// value cannot be nullable, as null is used by storage engines to indicate a key is deleted
export interface Setting<V extends Exclude<any, null>> {
    key: string;
    default_value: V;
    local_only?: boolean; // default false, if true, setting will not be placed into sync storage. note that changing this will make the setting value reset as a different storage engine is used
}

const build_settings = <T extends Record<string, Omit<Setting<any>, "key">>>(
    settings: T
): { [K in keyof T]: Setting<T[K]["default_value"]> } => {
    const result = {} as any;
    for (const [key, setting] of Object.entries(settings)) {
        result[key] = {
            key,
            ...setting
        };
    }
    return result;
};

export const settings = build_settings({
    watch_hand: {
        default_value: "left"
    },
    use_debug_input: {
        default_value: false,
        local_only: true
    },

    spectator_view: {
        default_value: "first_person" as "first_person" | "third_person" | "mixed_reality",
    },
    third_person_fov: {
        default_value: 60
    },

    debug_ray_hits: {
        default_value: false,
        local_only: true
    },
    debug_clicks: {
        default_value: false,
        local_only: true
    },
    debug_touch: {
        default_value: false,
        local_only: true
    }
});

export type SettingKey = keyof typeof settings;

export type SettingKeyReturning<V extends Exclude<any, null>> = {
    [K in SettingKey]: (typeof settings)[K]["default_value"] extends V ? K : never;
}[SettingKey];
