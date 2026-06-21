import { Canvas } from "@react-three/fiber";
import { createXRStore, XR } from "@react-three/xr";
import { useEffect, useState } from "react";

import { Storage } from "@plasmohq/storage";






import "~shared.css";



import { DOMMirror } from "~components/DOMMirror";





const storage = new Storage();

export const config = { matches: ["<all_urls>"], all_frames: true };

const xrStore = createXRStore({});

const VREnvironment = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [isSticky, setIsSticky] = useState(false);

    const enterVR = async () => {
        try {
            xrStore.enterVR();

            await storage.set("isInVRSession", true);
            setIsVisible(true);
            setIsSticky(false); // Hide the resume button once active
            console.log("XR Session Started");
        } catch (e) {
            console.error("Failed to enter VR:", e);
        }
    };

    // Also listen to the store's session state to clean up your extension flags when exiting VR
    useEffect(() => {
        // You can subscribe to changes in the XR store state
        const unsub = xrStore.subscribe((state) => {
            // If we were visible, but the active session is now null, the user exited VR
            if (isVisible && !state.session) {
                storage.set("isInVRSession", false);
                setIsVisible(false);
            }
        });
        return () => unsub();
    }, [isVisible]);

    useEffect(() => {
        // 1. Determine if we should show the "Resume" prompt
        const checkStickySession = async () => {
            const wasInVR = await storage.get("isInVRSession");
            if (wasInVR) {
                setIsVisible(true);
                setIsSticky(true);
            }
        };
        checkStickySession();

        // 2. Listen for the Context Menu message
        const handleMessage = (message: any) => {
            if (message.action === "VVR_ACTIVATE") {
                setIsVisible(true);
                setIsSticky(false);
                enterVR();
            }
        };

        chrome.runtime.onMessage.addListener(handleMessage);
        return () => chrome.runtime.onMessage.removeListener(handleMessage);
    }, []);

    if (!isVisible) return null;

    return (
        <>
            {/* Only show the button if we are in the 'Resume' state */}
            {isSticky && (
                <button
                    onClick={enterVR}
                    style={{
                        pointerEvents: "auto",
                        position: "absolute",
                        top: "20px",
                        left: "20px",
                        padding: "10px",
                        zIndex: 100
                    }}>
                    Resume Spatial Session
                </button>
            )}
            <div
                //className="hidden" why isnt tialwind working, whatever
                // TODO: let this be shown for dbeugging in popup
                style={{
                    visibility: "hidden"
                }}
            >
                <Canvas style={{ pointerEvents: "auto" }}>
                    <XR store={xrStore}>
                    <ambientLight intensity={0.5} />
                    <pointLight position={[10, 10, 10]} />
                    <mesh>
                        <boxGeometry args={[1, 1, 1]} />
                        <meshStandardMaterial color="orange" />
                    </mesh>
                    <DOMMirror />
                    </XR>
                </Canvas>
            </div>
        </>
    );
}

export default VREnvironment;
