import  { ComponentType, ReactNode } from "react";

export const ContextProviders = ({ children, providers }: { children: ReactNode; providers: ComponentType<{children: ReactNode}>[] }) => {
    return providers.reduceRight((acc, Provider) => {
        return <Provider>{acc}</Provider>;
    }, children);
};
