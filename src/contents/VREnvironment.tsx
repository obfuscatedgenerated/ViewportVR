import { Canvas } from "@react-three/fiber";
import { useEffect, useState } from "react";



import { Storage } from "@plasmohq/storage";






import "~shared.css";



import { DOMMirror } from "~components/DOMMirror";





const storage = new Storage();

export const config = { matches: ["<all_urls>"], all_frames: true };

const VREnvironment = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [isSticky, setIsSticky] = useState(false);

    const enterVR = async () => {
        try {
            const session = await navigator.xr?.requestSession("immersive-vr", {
                optionalFeatures: ["local-floor", "bounded-floor"]
            });

            // Handle session exit to clean up the sticky flag
            session.addEventListener("end", async () => {
                await storage.set("isInVRSession", false);
                setIsVisible(false);
            });

            await storage.set("isInVRSession", true);
            setIsVisible(true);
            setIsSticky(false); // Hide the resume button once active
            console.log("XR Session Started", session);
        } catch (e) {
            console.error("Failed to enter VR:", e);
        }
    };

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
                    <ambientLight intensity={0.5} />
                    <pointLight position={[10, 10, 10]} />
                    <mesh>
                        <boxGeometry args={[1, 1, 1]} />
                        <meshStandardMaterial color="orange" />
                    </mesh>
                    <DOMMirror />
                </Canvas>
            </div>
        </>
    );
}

export default VREnvironment;
