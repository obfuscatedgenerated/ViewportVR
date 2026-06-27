export enum Layer {
    Default = 0,
    PlayerModel_Head = 1,
    PlayerModel_TorsoAndHands = 2,
    MR_ForceForeground = 3,
    MR_PlayerCapsule = 4
}

export const compute_layer_mask = (layers: Layer[]): number => {
    return layers.reduce((mask, layer) => mask | (1 << layer), 0);
}
