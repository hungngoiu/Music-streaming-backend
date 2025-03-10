export enum namespaces {
    Verification = "verification",
    JWT_Token_Blacklist = "blacklist",
    JWT_Refresh_Token = "refresh_token"
}

export type redisSetDto = {
    namespace: namespaces;
    key: string;
    value: string;
};

export type redisGetDto = {
    namespace: namespaces;
    key: string;
};

export type redisDeleteDto = {
    namespace: namespaces;
    key: string;
};
