import type { ButtonPrefab } from "@hyperlinkvr/vr-engine-schemas";
import { Text } from "@react-three/drei";

export const Button = (props: Omit<ButtonPrefab, "type" | "name">) => {
    return (
        <Text
            fontSize={0.1}
            color={props.color || "black"}
            anchorX="center"
            anchorY="middle"
        >
            {props.label} (pretend i'm a button :P)
        </Text>
    );
}
