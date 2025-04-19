import { Album, Prisma } from "@prisma/client";
import prismaClient from "@/databases/prisma.js";

export const albumRepo = {
    create: (
        data: Prisma.AlbumCreateInput,
        options?: Omit<Prisma.AlbumCreateArgs, "data">
    ): Promise<Album> => {
        return prismaClient.album.create({
            data,
            ...options
        });
    },

    getOneByFilter: (
        filter: Prisma.AlbumWhereInput,
        options?: Omit<Prisma.AlbumFindFirstArgs, "where">
    ): Promise<Album | null> => {
        return prismaClient.album.findFirst({ where: filter, ...options });
    },

    update: (
        filter: Prisma.AlbumWhereUniqueInput,
        data: Prisma.AlbumUpdateInput,
        options?: Omit<Prisma.AlbumUpdateArgs, "data" | "where">
    ): Promise<Album> => {
        return prismaClient.album.update({
            where: filter,
            data,
            ...options
        });
    },

    delete: (
        filter: Prisma.AlbumWhereUniqueInput,
        options?: Omit<Prisma.AlbumDeleteArgs, "where">
    ): Promise<Album> => {
        return prismaClient.album.delete({
            where: filter,
            ...options
        });
    },

    connectSongs: async (albumId: string, songIds: string[]) => {
        await prismaClient.$transaction(async (tx) => {
            await tx.album.update({
                where: {
                    id: albumId
                },
                data: {
                    songs: {
                        updateMany: {
                            where: {},
                            data: {
                                albumOrder: null
                            }
                        },
                        set: songIds.map((id) => {
                            return { id: id };
                        })
                    }
                }
            });
            await Promise.all(
                songIds.map((id, index) =>
                    tx.song.update({
                        where: { id },
                        data: { albumOrder: (index + 1) * 10 }
                    })
                )
            );
        });
    },

    addSong: async (alBumId: string, songId: string, index?: number) => {
        const songs = await prismaClient.song.findMany({
            where: {
                albumId: alBumId
            },
            orderBy: {
                albumOrder: "asc"
            }
        });
        if (songs.map((song) => song.id).includes(songId)) {
            return { songAlreadyInAlbum: true };
        }
        if (!index || index >= songs.length) {
            await prismaClient.song.update({
                where: {
                    id: songId
                },
                data: {
                    albumOrder: songs[songs.length - 1].albumOrder! + 10,
                    album: {
                        connect: {
                            id: alBumId
                        }
                    }
                }
            });
            return { songAlreadyInAlbum: false };
        }
        const prev = songs[index - 1].albumOrder!;
        const next = songs[index].albumOrder!;

        // check if there is space for insert
        if (next - prev > 1) {
            await prismaClient.song.update({
                where: {
                    id: songId
                },
                data: {
                    albumOrder: (prev + next) / 2,
                    album: {
                        connect: {
                            id: alBumId
                        }
                    }
                }
            });
            return { songAlreadyInAlbum: false };
        }
        // repopulate the sparse list
        let start = index - 5 >= 0 ? index - 5 : 0;
        let end = index + 5 < songs.length ? index + 5 : songs.length - 1;
        while (
            songs[end].albumOrder! - songs[start].albumOrder! <
                10 * (end - start + 1) &&
            (start != 0 || end != songs.length - 1)
        ) {
            start = start - 5 >= 0 ? start - 5 : 0;
            end = end + 5 < songs.length ? end + 5 : songs.length - 1;
        }
        const startOrder = start != 0 ? songs[start].albumOrder! : 10;
        if (end != songs.length - 1) {
            const endOrder = songs[end].albumOrder!;
            const step = (endOrder - startOrder) / (end - start);
            await prismaClient.$transaction(
                songs.map((song, index) =>
                    prismaClient.song.update({
                        where: {
                            id: song.id
                        },
                        data: {
                            albumOrder: startOrder + index * step
                        }
                    })
                )
            );

            await prismaClient.song.update({
                where: {
                    id: songId
                },
                data: {
                    albumOrder: startOrder + index * step - step / 2,
                    album: {
                        connect: {
                            id: alBumId
                        }
                    }
                }
            });
            return { songAlreadyInAlbum: false };
        }
        await prismaClient.$transaction(
            songs.map((song, index) =>
                prismaClient.song.update({
                    where: {
                        id: song.id
                    },
                    data: {
                        albumOrder: startOrder + index * 10
                    }
                })
            )
        );

        await prismaClient.song.update({
            where: {
                id: songId
            },
            data: {
                albumOrder: startOrder + index * 10 - 10 / 2,
                album: {
                    connect: {
                        id: alBumId
                    }
                }
            }
        });
        return { songAlreadyInAlbum: false };
    }
};
