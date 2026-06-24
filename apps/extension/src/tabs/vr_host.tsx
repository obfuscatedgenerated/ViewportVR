import { useCallback, useEffect, useRef, useState } from "react";

import "~shared.css";

import { TabSessionProvider } from "@viewportvr/react";
import { VRHost, xr_store } from "@viewportvr/vr-engine";

const SpectatorWindow = () => {
    const [started, setStarted] = useState(false);
    const [is_supported, setIsSupported] = useState<boolean | null>(false);

    const enter_vr = useCallback(() => {
        if (started) return;

        xr_store.enterVR().catch(console.error);
        setStarted(true);
    }, [setStarted]);

    useEffect(() => {
        const check_support = async () => {
            if (!navigator.xr) {
                setIsSupported(null);
                return;
            }

            const supported =
                await navigator.xr.isSessionSupported("immersive-vr");
            setIsSupported(supported);
        };

        check_support();

        const handle_device_change = async () => {
            const supported =
                await navigator.xr?.isSessionSupported("immersive-vr");
            setIsSupported(supported || false);
        };

        navigator.xr?.addEventListener("devicechange", handle_device_change);

        return () => {
            navigator.xr?.removeEventListener(
                "devicechange",
                handle_device_change
            );
        };
    }, []);

    const canvas_container_ref = useRef<HTMLDivElement>(null);

    if (is_supported === null) {
        return (
            <div className="bg-black/80 backdrop-blur-md absolute inset-0 flex flex-col items-center justify-center z-50 text-white gap-8">
                <h1 className="font-title text-3xl">ViewportVR</h1>
                <p className="text-lg">
                    WebXR is not supported in this browser.
                </p>
            </div>
        );
    }

    return (
        <TabSessionProvider>
            <main className="font-sans">
                {!started && (
                    <div className="bg-black/80 backdrop-blur-md absolute inset-0 flex flex-col items-center justify-center z-50 text-white gap-8">
                        <h1 className="font-title text-3xl">ViewportVR</h1>

                        <button
                            className="px-4 py-2 bg-blue-600 rounded-lg hover:not-disabled:bg-blue-700 transition text-xl font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-600"
                            onClick={enter_vr}
                            disabled={!is_supported}>
                            {is_supported
                                ? "Enter VR"
                                : "No VR device detected!"}
                        </button>
                    </div>
                )}
                <div className="h-screen w-screen bg-black flex items-center justify-center">
                    <VRHost />
                </div>
            </main>
        </TabSessionProvider>
    );
};

export default SpectatorWindow;
