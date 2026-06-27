import { useThree } from "@react-three/fiber";
import { useEffect } from "react";

import { compute_layer_mask, Layer } from "./layers";

const layer_mask = compute_layer_mask([
    Layer.Default,
    Layer.PlayerModel_TorsoAndHands
]);

export const CameraSetup = () => {
    const {camera} = useThree();

    // opt into the layers we want to see in VR
    useEffect(() => {
        camera.layers.mask = layer_mask;
    }, [camera]);

    return null;
}
