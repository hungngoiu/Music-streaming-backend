import redisClient from "@/databases/redis.js";
import { redisDeleteDto, redisGetDto, redisSetDto } from "@/types/dto/index.js";
import { SetOptions } from "redis";

interface redisServiceInterface {
    set: (data: redisSetDto, options?: SetOptions) => Promise<string | null>;
    get: (data: redisGetDto) => Promise<string | null>;
    delete: (data: redisDeleteDto) => Promise<number>;
}
export const redisService: redisServiceInterface = {
    set: async (data: redisSetDto, options?: SetOptions) => {
        const { namespace, key, value } = data;
        return await redisClient.set(namespace + ":" + key, value, options);
    },

    get: async (data: redisGetDto) => {
        const { namespace, key } = data;
        return await redisClient.get(namespace + ":" + key);
    },

    delete: async (data: redisDeleteDto) => {
        const { namespace, key } = data;
        return await redisClient.del(namespace + ":" + key);
    }
};
