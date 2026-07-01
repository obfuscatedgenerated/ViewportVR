import type { CreatedEngineObject } from "@hyperlinkvr/vr-engine-schemas";
import { useMemo, useRef } from "react";
import type { Group } from "three";

import type { RendererComponentProps } from "../types";
import { CustomObjectRenderer } from "./CustomObjectRenderer";
import { PrefabRenderer } from "./PrefabRenderer";


export const EngineObjectRenderer = ({data}: {data: CreatedEngineObject}) => {
    const {type, ...obj_rest} = data.object;

    const RendererComponent = useMemo(
        () => type === "prefab" ? PrefabRenderer : CustomObjectRenderer,
        [data.object.type]
    ) as React.ComponentType<RendererComponentProps<any>>;

    const root_ref = useRef<Group>(null);
    
    return (
        <group
            ref={root_ref}
            position={data.transform.position}
            //rotation={data.transform.rotation} // TODO: need order on euler rotation data, and how do we use quat?
            scale={data.transform.position}
        >
            <RendererComponent root_ref={root_ref} {...obj_rest} />
        </group>
    );
}
