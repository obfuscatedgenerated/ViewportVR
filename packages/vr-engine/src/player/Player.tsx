import { useXRControllerLocomotion, XROrigin } from "@react-three/xr";
import { useImperativeHandle, useRef } from "react";
import { Group } from "three";

import { Avatar } from "./Avatar";
import { WristWatch } from "./WristWatch";
import { PlayerExpressionProvider } from "../contexts/PlayerExpressionContext";


export const Player = ({ref = null}: {ref?: React.Ref<Group>}) => {
    const origin_ref = useRef<Group>(null);
    useImperativeHandle(ref, () => origin_ref.current!);
    
    useXRControllerLocomotion(origin_ref);

    return (
        <group name="Player">
            <PlayerExpressionProvider>
                <XROrigin ref={origin_ref}>
                    <WristWatch />
                </XROrigin>
    
                <Avatar />
            </PlayerExpressionProvider>
        </group>
    );
}
