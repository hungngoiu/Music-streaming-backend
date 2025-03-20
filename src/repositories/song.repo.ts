import prismaClient from "@/databases/prisma.js";
import { Prisma, Song } from "@prisma/client";

export const songRepo = {
    createOne: (
        data: Prisma.SongCreateInput,
        options?: Omit<Prisma.SongCreateArgs, "data">
    ): Promise<Song> => {
        return prismaClient.song.create({
            data: data,
            ...options
        });
    },

    getOnebyFilter: (
        filter: Prisma.SongWhereInput,
        options?: Omit<Prisma.SongFindFirstArgs, "where">
    ): Promise<Song | null> => {
        return prismaClient.song.findFirst({
            where: filter,
            ...options
        });
    },

    getManyByFilter: (
        filter: Prisma.SongWhereInput,
        options?: Omit<Prisma.SongFindManyArgs, "where">
    ): Promise<Song[]> => {
        return prismaClient.song.findMany({
            where: filter,
            ...options
        });
    },

    update: (
        filter: Prisma.SongWhereUniqueInput,
        data: Prisma.SongUpdateInput,
        options?: Omit<Prisma.SongUpdateArgs, "where" | "data">
    ): Promise<Song> => {
        return prismaClient.song.update({
            where: filter,
            data: data,
            ...options
        });
    },

    delete: (
        filter: Prisma.SongWhereUniqueInput,
        options?: Omit<Prisma.SongDeleteArgs, "where">
    ): Promise<Song> => {
        return prismaClient.song.delete({
            where: filter,
            ...options
        });
    }
};
