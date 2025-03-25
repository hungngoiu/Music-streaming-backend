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
        options?: { limit?: number; offset?: number }
    ): Promise<Song[]> => {
        const { name = "", userId } = filter;
        const { offset = 0, limit = 10 } = options ?? { undefined };
        const sql = userId
            ? searchSongswithUserId(name, limit, offset, userId)
            : searchSongs(name, limit, offset);
        const songs = await prismaClient.$queryRawTyped(sql);
        return songs.map((song) => {
            return {
                userId: song.user_id,
                coverImagePath: song.cover_image_path,
                audioFilePath: song.audio_file_path,
                ...omitPropsFromObject(song, [
                    "audio_file_path",
                    "cover_image_path",
                    "user_id",
                    "rank"
                ])
            };
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
