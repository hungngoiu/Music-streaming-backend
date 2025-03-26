import prismaClient from "@/databases/prisma.js";
import { omitPropsFromObject } from "@/utils/object.js";
import { Prisma, Song } from "@prisma/client";
import { searchSongs, searchSongswithUserId } from "@prisma/client/sql";

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

    searchSongs: async (
        filter: { userId?: string; name?: string },
        options?: Omit<Prisma.SongFindManyArgs, "where">
    ): Promise<Song[]> => {
        const { name = "", userId } = filter;
        const { skip = 0, take = 10 } = options ?? { undefined };
        const sql = userId
            ? searchSongswithUserId(name, take, skip, userId)
            : searchSongs(name, take, skip);
        const results = await prismaClient.$queryRawTyped(sql);
        const ids = results.map((result) => result.id);

        const songs = await prismaClient.song.findMany({
            where: { id: { in: ids } },
            ...(options ? omitPropsFromObject(options, ["skip", "take"]) : {})
        });

        const idOrderMap = new Map(ids.map((id, index) => [id, index]));
        songs.sort((a, b) => idOrderMap.get(a.id)! - idOrderMap.get(b.id)!);
        return songs;
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
