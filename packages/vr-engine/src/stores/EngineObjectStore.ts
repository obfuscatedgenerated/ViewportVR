import type { CreatedEngineObject } from "@hyperlinkvr/vr-engine-schemas";
import { create } from "zustand";

interface EngineObjectState {
    // id->object data
    objects: Record<string, CreatedEngineObject>;

    add_object: (obj: CreatedEngineObject) => void;
    remove_object: (id: string) => void;
}

export const useEngineObjectStore = create<EngineObjectState>((set) => ({
    objects: {},

    add_object: (obj) =>
        set((state) => ({
            objects: { ...state.objects, [obj.id]: obj }
        })),

    remove_object: (id) =>
        set((state) => {
            const next = { ...state.objects };
            delete next[id];
            return { objects: next };
        })
}));
