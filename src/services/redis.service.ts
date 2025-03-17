import redisClient from "@/databases/redis.js";
import { RedisDeleteDto, RedisGetDto, RedisSetDto } from "@/types/dto/index.js";
import { SetOptions } from "redis";

interface redisServiceInterface {
    set: (data: RedisSetDto, options?: SetOptions) => Promise<string | null>;
    get: (data: RedisGetDto) => Promise<string | null>;
    delete: (data: RedisDeleteDto) => Promise<number>;
}
export const redisService: redisServiceInterface = {
    set: async (data: RedisSetDto, options?: SetOptions) => {
        const { namespace, key, value } = data;
        return await redisClient.set(namespace + ":" + key, value, options);
    },

    get: async (data: RedisGetDto) => {
        const { namespace, key } = data;
        return await redisClient.get(namespace + ":" + key);
    },

    delete: async (data: RedisDeleteDto) => {
        const { namespace, key } = data;
        return await redisClient.del(namespace + ":" + key);
    }
};
