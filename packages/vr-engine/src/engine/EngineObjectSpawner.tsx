import { EngineObjectRenderer } from "./EngineObjectRenderer";
import { useEngineObjectStore } from "../stores/EngineObjectStore";
import { useMemo } from "react";

export const EngineObjectSpawner = () => {
    const object_map = useEngineObjectStore((state) => state.objects);
    const objects = useMemo(() => Object.values(object_map), [object_map]);

    return (
        <>
            {objects.map((obj) => (
                <EngineObjectRenderer key={obj.id} data={obj} />
            ))}
        </>
    );
};
