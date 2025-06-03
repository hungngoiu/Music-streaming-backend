import { Prisma } from "@prisma/client";
import prismaClient from "@/databases/prisma.js";
import { StatusCodes } from "http-status-codes";
import { CustomError } from "@/errors/index.js";

export const playlistRepo = {
    create: (
        data: Prisma.PlaylistCreateInput,
        options?: Omit<Prisma.PlaylistCreateArgs, "data">
    ) => {
        return prismaClient.playlist.create({
            data,
            ...options
        });
    },

    getOneByFilter: (
        filter: Prisma.PlaylistWhereInput,
        options?: Omit<Prisma.PlaylistFindFirstArgs, "where">
    ) => {
        return prismaClient.playlist.findFirst({ where: filter, ...options });
    },

    update: (
        filter: Prisma.PlaylistWhereUniqueInput,
        data: Prisma.PlaylistUpdateInput,
        options?: Omit<Prisma.PlaylistUpdateArgs, "data" | "where">
    ) => {
        return prismaClient.playlist.update({
            where: filter,
            data,
            ...options
        });
    },

    delete: (
        filter: Prisma.PlaylistWhereUniqueInput,
        options?: Omit<Prisma.PlaylistDeleteArgs, "where">
    ) => {
        return prismaClient.playlist.delete({
            where: filter,
            ...options
        });
    },

    addSong: async (playlistId: string, songId: string) => {
        return await prismaClient.$transaction(async (tx) => {
            const playlistSongs = await tx.playlistSong.findMany({
                where: {
                    playlistId
                },
                orderBy: {
                    playlistOrder: "asc"
                }
            });

            if (
                playlistSongs.findIndex(
                    (playlistSong) => playlistSong.songId == songId
                ) != -1
            ) {
                throw new CustomError(
                    "Song already added to the playlist",
                    StatusCodes.CONFLICT
                );
            }

            await tx.playlistSong.create({
                data: {
                    playlist: {
                        connect: {
                            id: playlistId
                        }
                    },
                    song: {
                        connect: {
                            id: songId
                        }
                    },
                    playlistOrder: playlistSongs.length
                }
            });
        });
    }
};
