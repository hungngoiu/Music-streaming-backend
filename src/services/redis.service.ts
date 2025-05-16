import redisClient from "@/databases/redis.js";
import {
    RedisDeleteDto,
    RedisGetDto,
    RedisSetAddDto,
    RedisSetDto
} from "@/types/dto/index.js";

interface RedisServiceInterface {
    set: (
        data: RedisSetDto,
        options?: { EX: number }
    ) => Promise<string | null>;
    get: (data: RedisGetDto) => Promise<string | null>;
    delete: (data: RedisDeleteDto) => Promise<number>;
    setAdd: (data: RedisSetAddDto, options?: { EX: number }) => Promise<number>;
    getSetMembers: (data: RedisGetDto) => Promise<string[]>;
    isExist: (data: RedisGetDto) => Promise<boolean>;
    setExpire: (data: RedisGetDto, ttl: number) => Promise<boolean>;
}
export const redisService: RedisServiceInterface = {
    isExist: async (data: RedisGetDto) => {
        const { namespace, key } = data;
        return (await redisClient.exists(namespace + ":" + key)) === 1;
    },

    set: async (data: RedisSetDto, options?: { EX: number }) => {
        const { namespace, key, value } = data;
        return await redisClient.set(namespace + ":" + key, value, options);
    },

    get: async (data: RedisGetDto) => {
        const { namespace, key } = data;
        return await redisClient.get(namespace + ":" + key);
    },

    delete: async (data: RedisDeleteDto) => {
        const { namespace, keys } = data;
        return await redisClient.del(keys.map((key) => namespace + ":" + key));
    },

    setAdd: async (data: RedisSetAddDto, options?: { EX: number }) => {
        const { namespace, key, members } = data;
        const result = await redisClient.sAdd(namespace + ":" + key, members);
        if (options?.EX) {
            await redisClient.expire(namespace + ":" + key, options.EX);
        }
        return result;
    },

    getSetMembers: async (data: RedisGetDto) => {
        const { namespace, key } = data;
        return redisClient.sMembers(namespace + ":" + key);
    },

    setExpire: async (data: RedisGetDto, ttl: number) => {
        const { namespace, key } = data;

        return redisClient.expire(namespace + ":" + key, ttl);
    }
};
