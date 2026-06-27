export interface Identity {
    name: string;
    host: string;
}

export interface PublicAuthInfo {
    identity: Identity;
    avatar_url?: string;
}

export interface PrivateAuthInfo extends PublicAuthInfo {
    authed_at: number;
}
