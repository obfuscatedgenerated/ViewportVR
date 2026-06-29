import { createContext, useCallback, useContext, useReducer } from "react";

export const expression_eyes_options = ["default"] as const;
export const expression_mouth_options = ["default", "big_smile", "wobbly_frown"] as const;

export type ExpressionEyes = typeof expression_eyes_options[number];
export type ExpressionMouth = typeof expression_mouth_options[number];

export interface PlayerExpression {
    eyes: ExpressionEyes;
    mouth: ExpressionMouth;
}

export interface PlayerExpressionContextType extends PlayerExpression {
    dispatch_expression: React.Dispatch<Partial<PlayerExpression>>;
    set_eyes: (new_eyes: ExpressionEyes) => void;
    set_mouth: (new_mouth: ExpressionMouth) => void;
}

const default_expression: PlayerExpression = {
    eyes: "default",
    mouth: "default",
};

const PlayerExpressionContext = createContext<PlayerExpressionContextType>({
    ...default_expression,
    dispatch_expression: () => {},
    set_eyes: () => {},
    set_mouth: () => {},
});

export const PlayerExpressionProvider = ({ children, initial_expression = default_expression }: { children: React.ReactNode; initial_expression?: PlayerExpression }) => {
    const [expression, dispatch_expression] = useReducer(
        (state: PlayerExpression, action: Partial<PlayerExpression>) => ({
            ...state,
            ...action,
        }),
        initial_expression
    );

    const { eyes, mouth } = expression;

    const set_eyes = useCallback((new_eyes: ExpressionEyes) => {
        dispatch_expression({ eyes: new_eyes });
    }, []);

    const set_mouth = useCallback((new_mouth: ExpressionMouth) => {
        dispatch_expression({ mouth: new_mouth });
    }, []);
    
    return (
        <PlayerExpressionContext.Provider
            value={{
                eyes,
                mouth,
                dispatch_expression,
                set_eyes,
                set_mouth,
            }}
        >
            {children}
        </PlayerExpressionContext.Provider>
    );
};

export const usePlayerExpression = () => {
    const context = useContext(PlayerExpressionContext);
    if (!context) {
        throw new Error("usePlayerExpression must be used within a PlayerExpressionProvider");
    }
    return context;
};
