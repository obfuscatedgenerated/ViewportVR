import { CreatedEngineObject } from "@hyperlinkvr/vr-engine-schemas";
import { Text } from "@react-three/drei";

export const EngineObjectRenderer = ({data}: {data: CreatedEngineObject}) => {
    return (
        <Text
            position={data.transform.position}
            //rotation={object.transform.rotation} // TODO: need order on euler rotation data, and how do we use quat?
            scale={data.transform.scale}
            fontSize={0.1}
        >
            Test: {data.id}
        </Text>
    );
}
