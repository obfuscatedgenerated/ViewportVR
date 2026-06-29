import { createContext, RefObject, useContext } from "react";
import type { Group } from "three";

export type XROriginContextType = RefObject<Group | null>;
const XROriginContext = createContext<XROriginContextType | null>(null);

export const XROriginProvider = ({ children, value }: { children: React.ReactNode; value: XROriginContextType }) => {
    return (
        <XROriginContext.Provider value={value}>
            {children}
        </XROriginContext.Provider>
    );
}

export const useXROrigin = () => {
    const context = useContext(XROriginContext);
    if (context === null) {
        throw new Error("useXROrigin must be used within a XROriginProvider");
    }

    return context;
}
