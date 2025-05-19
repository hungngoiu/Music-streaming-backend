import { namespaces } from "@/configs/redis.config.js";

export type RedisSetDto = {
    namespace: namespaces;
    key: string;
    value: string;
};

export type RedisGetDto = {
    namespace: namespaces;
    key: string;
};

export type RedisDeleteDto = {
    namespace: namespaces;
    keys: string[];
};

export type RedisSetAddDto = {
    namespace: string;
    key: string;
    members: string[];
};
