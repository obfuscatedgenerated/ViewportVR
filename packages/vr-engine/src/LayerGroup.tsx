import { useLayoutEffect, useMemo, useRef } from "react";
import type { Group } from "three";


import {compute_layer_mask, Layer} from "./layers";

interface LayerGroupProps {
    layers: Layer[];
    children: React.ReactNode;
}

export const LayerGroup = ({
    layers,
    children
}: LayerGroupProps) => {
    const group_ref = useRef<Group>(null);

    const layers_hash = layers.join(",");
    const layer_mask = useMemo(() => compute_layer_mask(layers), [layers_hash]);

    const previous_state_hash = useRef<string>("");

    useLayoutEffect(() => {
        if (group_ref.current) {
            // determine if a child actually changed (removed/added, not just re-renders)
            // could just apply differentially to changed children, but its probably more efficient to just do the layer set each time (2 bitwise ops vs a set lookup for each node)
            let uuids = "";
            group_ref.current.traverse((child) => {
                uuids += child.uuid;
            });

            let state_hash = `${uuids}|${layer_mask}`;

            if (state_hash !== previous_state_hash.current) {
                previous_state_hash.current = state_hash;

                group_ref.current.traverse((child) => {
                    // apply the layers to each child object in the group
                    child.layers.mask = layer_mask;
                });
            }
        }
    }, [layer_mask, children]);

    return <group ref={group_ref}>{children}</group>;
};
