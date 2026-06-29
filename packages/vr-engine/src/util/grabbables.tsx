import { useFrame } from "@react-three/fiber";
import { useXRInputSourceState } from "@react-three/xr";
import { ComponentProps, RefObject, useEffect, useImperativeHandle, useRef, useState } from "react";
import { BackSide, Group, Matrix4, Mesh, MeshBasicMaterial, Object3D, Vector3 } from "three";

import { useXROrigin } from "../contexts";

export const useOutlineEffect = (
    target_ref: RefObject<Object3D | null>,
    enabled: boolean,
    color = 0x87ed87
) => {
    useEffect(() => {
        const target = target_ref.current;
        if (!target || !enabled) return;

        // 1. Collect all valid meshes into an array first
        const meshes: Mesh[] = [];
        target.traverse((child) => {
            if ((child as Mesh).isMesh && !child.userData._is_outline_effect) {
                meshes.push(child as Mesh);
            }
        });

        // 2. Add outlines to the collected meshes
        meshes.forEach((mesh) => {
            const outline = new Mesh(
                mesh.geometry,
                new MeshBasicMaterial({
                    color: color,
                    side: BackSide
                })
            );

            outline.scale.setScalar(1.05);
            outline.userData._is_outline_effect = true;

            mesh.add(outline);

            // inherit layers from the mesh TODO: should it add a custom outline layer?
            outline.layers.mask = mesh.layers.mask;
        });

        return () => {
            if (!target) return;

            // 3. Remove in a clean pass
            target.traverse((child) => {
                const outlines = child.children.filter(
                    (c) => c.userData._is_outline_effect
                );
                outlines.forEach((outline) => child.remove(outline));
            });
        };
    }, [enabled, color, target_ref]);
};

// export const CustomHandleTarget = ({children}: {children: React.ReactNode}) => {
//     return (
//         <HandleTarget>
//             {children}
//         </HandleTarget>
//     );
// }
//
// export const CustomHandle = (props: React.ComponentPropsWithoutRef<typeof Handle>) => {
//     const {children, bind, handleRef, ...rest} = props;
//
//     return (
//         <Handle bind={false} {...rest}>
//             <HighlightWhenInReach>
//                 {children}
//             </HighlightWhenInReach>
//         </Handle>
//     );
// }

export const useGrabbable = (
    target_ref: RefObject<Object3D | null>,
    {
        grab_distance = 0.4,
        nearby_trigger_distance = 0.4,
        on_nearby_start,
        on_nearby_end
    }: {
        grab_distance?: number,
        nearby_trigger_distance?: number,
        on_nearby_start?: (input: XRInputSource) => void,
        on_nearby_end?: (input: XRInputSource) => void
    } = {}
) => {
    const leftController = useXRInputSourceState('controller', 'left');
    const rightController = useXRInputSourceState('controller', 'right');
    const xr_origin_ref = useXROrigin();

    const grabbingSource = useRef<XRInputSource | null>(null);
    const offsetMatrix = useRef(new Matrix4());
    const tempMatrix = useRef(new Matrix4());
    const nearbyInputs = useRef(new Set<XRInputSource>());

    useFrame((state, delta, frame) => {
        if (!frame || !target_ref.current || !xr_origin_ref?.current) return;
        target_ref.current.updateMatrixWorld();
        xr_origin_ref.current.updateMatrixWorld();

        const refSpace = state.gl.xr.getReferenceSpace();
        if (!refSpace) return;

        const controllers = [leftController, rightController].filter(Boolean);
        const currentlyNear = new Set<XRInputSource>();

        let activeHandMatrix: Matrix4 | null = null;

        for (const controller of controllers) {
            if (!controller) continue;

            const gripSpace = controller.inputSource.gripSpace;
            if (!gripSpace) continue;

            const pose = frame.getPose(gripSpace, refSpace);
            if (!pose) continue;

            // raw pose is relative to the origin, not world — promote it before
            // it touches anything that compares against target_ref.matrixWorld
            const handMatrix = new Matrix4()
                .fromArray(pose.transform.matrix)
                .premultiply(xr_origin_ref.current.matrixWorld);

            const handPos = new Vector3().setFromMatrixPosition(handMatrix);
            const objPos = new Vector3().setFromMatrixPosition(
                target_ref.current.matrixWorld
            );
            const distance = handPos.distanceTo(objPos); // both true world space now

            if (distance < nearby_trigger_distance) {
                currentlyNear.add(controller.inputSource);
                if (!nearbyInputs.current.has(controller.inputSource)) {
                    on_nearby_start?.(controller.inputSource);
                }
            }

            const isSqueezing =
                controller.gamepad["xr-standard-squeeze"]?.state === "pressed";

            if (
                isSqueezing &&
                !grabbingSource.current &&
                distance < grab_distance
            ) {
                const inverseHand = handMatrix.clone().invert();
                offsetMatrix.current.multiplyMatrices(
                    inverseHand,
                    target_ref.current.matrixWorld
                );
                grabbingSource.current = controller.inputSource;
            } else if (
                !isSqueezing &&
                grabbingSource.current === controller.inputSource
            ) {
                grabbingSource.current = null;
            }

            if (grabbingSource.current === controller.inputSource) {
                activeHandMatrix = handMatrix;
            }
        }

        for (const input of nearbyInputs.current) {
            if (!currentlyNear.has(input)) on_nearby_end?.(input);
        }
        nearbyInputs.current = currentlyNear;

        if (grabbingSource.current && activeHandMatrix) {
            const newWorldMatrix = tempMatrix.current.multiplyMatrices(
                activeHandMatrix,
                offsetMatrix.current
            );

            // converts back to local space relative to whatever target_ref's parent is —
            // a no-op right now since the tripod's parent is the scene root, but this
            // keeps it correct if you ever nest a grabbable under something non-identity
            if (target_ref.current.parent) {
                target_ref.current.parent.updateMatrixWorld();
                const parentInverse = new Matrix4()
                    .copy(target_ref.current.parent.matrixWorld)
                    .invert();
                newWorldMatrix.premultiply(parentInverse);
            }

            newWorldMatrix.decompose(
                target_ref.current.position,
                target_ref.current.quaternion,
                target_ref.current.scale
            );

            target_ref.current.matrixAutoUpdate = true;
        }
    });
};

// TODO: accept props to allow scaling, position/rotation lock etc
// TODO: sticky (press another button to release) and non sticky (releases when grip lost) grabbables
// TODO: should actually snap to the hand by default at least, with option to allow the sort of berhaviour we want from the camera (the only current grabbable)
export const Grabbable = (props: ComponentProps<"group">) => {
    const {ref, children, ...rest} = props;

    const group_ref = useRef<Group | null>(null);
    useImperativeHandle(ref as RefObject<Group | null>, () => group_ref.current!);

    const [is_nearby, setIsNearby] = useState(false);
    useGrabbable(group_ref, {
        on_nearby_start: () => setIsNearby(true),
        on_nearby_end: () => setIsNearby(false)
    });

    useOutlineEffect(group_ref, is_nearby);

    return (
        <group ref={group_ref} {...rest}>
            {children}
        </group>
    );
}

// TODO: PhysicsGrabbable