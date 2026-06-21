import { Canvas } from "@react-three/fiber";
import { createXRStore, XR } from "@react-three/xr";
import React, { useCallback, useState } from "react";

import "~shared.css";
import "./vr_host.css";
import { DOMMirror } from "~components/DOMMirror";
import { SpectatorCamera } from "~components/SpectatorCamera";

const xr_store = createXRStore({});

const SpectatorWindow = () => {
    const [started, setStarted] = useState(false);

    const enter_vr = useCallback(
        () => {
            if (started) return;

            xr_store.enterVR().catch(console.error);
            setStarted(true);
        },
        [setStarted]
    );

    return (
        <>
            {!started && (
                <div className="bg-black/80 absolute inset-0 flex items-center justify-center z-50">
                    <button
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                        onClick={enter_vr}
                    >
                        Enter VR
                    </button>
                </div>
            )}
            <div style={{ width: "100vw", height: "100vh", background: "#000" }}>
                <Canvas gl={{ alpha: false }}>
                    <XR store={xr_store}>
                        <color attach="background" args={["#111111"]} />
                        <ambientLight intensity={0.5} />
                        <pointLight position={[10, 10, 10]} />

                        <DOMMirror position={[0, 1.5, -2]} />
                        <SpectatorCamera />
                    </XR>
                </Canvas>
            </div>
        </>
    );
};

export default SpectatorWindow;