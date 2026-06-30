export interface Identity {
    name: string;
    host: string;
}

export interface PublicAuthInfo {
    identity: Identity;
    public_key: JsonWebKey;
    avatar_url?: string;
}

export interface PrivateAuthInfo extends PublicAuthInfo {
    authed_at: number;
}
