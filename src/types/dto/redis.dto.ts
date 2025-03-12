import { namespaces } from "@/configs/redis.config.js";

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
