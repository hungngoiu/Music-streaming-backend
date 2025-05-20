import { Prisma } from "@prisma/client";
import prismaClient from "@/databases/prisma.js";

export const likeRepo = {
    create: (
        data: Prisma.LikeCreateInput,
        options?: Omit<Prisma.LikeCreateArgs, "data">
    ) => {
        return prismaClient.like.create({
            data: data,
            ...options
        });
    },

    getOneByFilter: (
        filter: Prisma.LikeWhereInput,
        options?: Omit<Prisma.LikeFindFirstArgs, "where">
    ) => {
        return prismaClient.like.findFirst({
            where: filter,
            ...options
        });
    },

    getManyByFilter: (
        filter: Prisma.LikeWhereInput,
        options?: Omit<Prisma.LikeFindManyArgs, "where">
    ) => {
        return prismaClient.like.findMany({
            where: filter,
            ...options
        });
    },

    delete: (
        filter: Prisma.LikeWhereUniqueInput,
        options?: Omit<Prisma.LikeDeleteArgs, "where">
    ) => {
        return prismaClient.like.delete({
            where: filter,
            ...options
        });
    },

    likeSong: (userId: string, songId: string) => {
        return prismaClient.$transaction(async (tx) => {
            const like = await tx.like.findFirst({ where: { userId, songId } });
            if (!like) {
                await tx.song.update({
                    where: { id: songId },
                    data: {
                        likesCount: {
                            increment: 1
                        }
                    }
                });
                return tx.like.create({ data: { songId, userId } });
            }
            return like;
        });
    },

    unlikeSong: (userId: string, songId: string) => {
        return prismaClient.$transaction(async (tx) => {
            const like = await tx.like.findFirst({ where: { userId, songId } });
            if (!like) {
                return;
            }
            await tx.like.delete({
                where: {
                    userId_songId: {
                        userId,
                        songId
                    }
                }
            });
            await tx.song.update({
                where: { id: songId },
                data: {
                    likesCount: {
                        decrement: 1
                    }
                }
            });
        });
    }
};
