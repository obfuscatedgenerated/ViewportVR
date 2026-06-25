import { Container, Text } from "@react-three/uikit";
import { Label, Switch } from "@react-three/uikit-default";
import { useState } from "react";
import { configureTextBuilder } from "troika-three-text";
import { useTabSession } from "@viewportvr/react";
import { MeshBasicMaterial, DoubleSide } from "three";

// its not happy! turn off web workers
configureTextBuilder({
    useWorker: false
});

export const WATCH_UI_WIDTH = 900;
export const WATCH_UI_HEIGHT = 600;

class DoubleSidedSolidPanel extends MeshBasicMaterial {
    constructor() {
        super({
            side: DoubleSide,
            transparent: true,
            depthWrite: false
        });
    }
}

export const WatchUI = () => {
    const [switchEnabled, setSwitchEnabled] = useState(false);
    const session = useTabSession();

    return (
        <Container
            width={WATCH_UI_WIDTH}
            height={WATCH_UI_HEIGHT}
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            backgroundColor="#4db8ff"
            opacity={0.8}
            borderRadius={16}
            panelMaterialClass={DoubleSidedSolidPanel}>
            <Container
                onPointerDown={() => {
                    console.log("hello");
                    setSwitchEnabled(!switchEnabled);
                }}
                flexDirection="row"
                alignItems="center"
                gap={8}>
                <Label>
                    <Text>Awesomeness detection</Text>
                </Label>

                <Switch checked={switchEnabled} />
            </Container>

            <Text>{session.url}</Text>
        </Container>
    );
};
