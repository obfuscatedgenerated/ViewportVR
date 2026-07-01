import type { Prefab } from "@hyperlinkvr/vr-engine-schemas";
import prefabs from "../prefabs";
import { useMemo } from "react";
import { RendererComponentProps } from "../types";

export const PrefabRenderer = (props: RendererComponentProps<Prefab>)=> {
    const { name, ...rest } = props;

    const PrefabComponent = useMemo(() => prefabs[name], [name]);
    if (!PrefabComponent) {
        console.warn(`Prefab "${name}" not found.`);
        return null;
    }

    return <PrefabComponent {...rest} />;
}
