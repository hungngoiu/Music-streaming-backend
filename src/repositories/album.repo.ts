import { Album, Prisma } from "@prisma/client";
import prismaClient from "@/databases/prisma.js";
import { searchAlbums, searchAlbumsWithUserId } from "@prisma/client/sql";
import { omitPropsFromObject } from "@/utils/object.js";

export const albumRepo = {
    create: (
        data: Prisma.AlbumCreateInput,
        options?: Omit<Prisma.AlbumCreateArgs, "data">
    ) => {
        return prismaClient.album.create({
            data,
            ...options
        });
    },

    getOneByFilter: (
        filter: Prisma.AlbumWhereInput,
        options?: Omit<Prisma.AlbumFindFirstArgs, "where">
    ) => {
        return prismaClient.album.findFirst({ where: filter, ...options });
    },

    update: (
        filter: Prisma.AlbumWhereUniqueInput,
        data: Prisma.AlbumUpdateInput,
        options?: Omit<Prisma.AlbumUpdateArgs, "data" | "where">
    ) => {
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

    searchAlbums: async (
        filter: { userId?: string; name?: string },
        options?: Omit<Prisma.AlbumFindManyArgs, "where">,
        loginUserId?: string
    ) => {
        const { name = "", userId } = filter;
        const { skip = 0, take = 10 } = options ?? { undefined };
        const sql = userId
            ? searchAlbumsWithUserId(
                  name,
                  take,
                  skip,
                  userId,
                  loginUserId ? loginUserId : ""
              )
            : searchAlbums(name, take, skip, loginUserId ? loginUserId : "");
        const results = await prismaClient.$queryRawTyped(sql);
        const ids = results.map((result) => result.id);

        const albums = await prismaClient.album.findMany({
            where: { id: { in: ids } },
            ...(options ? omitPropsFromObject(options, ["skip", "take"]) : {})
        });

        const idOrderMap = new Map(ids.map((id, index) => [id, index]));
        albums.sort((a, b) => idOrderMap.get(a.id)! - idOrderMap.get(b.id)!);
        return albums;
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
            await Promise.allSettled(
                songIds.map((id, index) =>
                    tx.song.update({
                        where: { id },
                        data: { albumOrder: (index + 1) * 10 }
                    })
                )
            );
        });
    },

    addSong: async (
        album: Prisma.AlbumGetPayload<{
            include: { songs: true };
        }>,
        songId: string,
        index?: number
    ) => {
        return await prismaClient.$transaction(async (tx) => {
            const songs = album.songs.sort(
                (a, b) => a.albumOrder! - b.albumOrder!
            );
            if (songs.length == 0) {
                await tx.song.update({
                    where: {
                        id: songId
                    },
                    data: {
                        albumOrder: 10,
                        album: {
                            connect: {
                                id: album.id
                            }
                        }
                    }
                });
                return;
            }
            if (index == undefined || index >= songs.length) {
                await tx.song.update({
                    where: {
                        id: songId
                    },
                    data: {
                        albumOrder: songs[songs.length - 1].albumOrder! + 10,
                        album: {
                            connect: {
                                id: album.id
                            }
                        }
                    }
                });
                return;
            }
            const prev = index > 0 ? songs[index - 1].albumOrder! : -1;
            const next = songs[index].albumOrder!;

            // check if there is space for insert
            if (next - prev > 1) {
                await tx.song.update({
                    where: {
                        id: songId
                    },
                    data: {
                        albumOrder: (prev + next) / 2,
                        album: {
                            connect: {
                                id: album.id
                            }
                        }
                    }
                });
                return;
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
                await Promise.allSettled(
                    songs.map((song, index) =>
                        tx.song.update({
                            where: {
                                id: song.id
                            },
                            data: {
                                albumOrder: startOrder + index * step
                            }
                        })
                    )
                );
                await tx.song.update({
                    where: {
                        id: songId
                    },
                    data: {
                        albumOrder: startOrder + index * step - step / 2,
                        album: {
                            connect: {
                                id: album.id
                            }
                        }
                    }
                });
                return;
            }
            await Promise.allSettled(
                songs.map((song, index) =>
                    tx.song.update({
                        where: {
                            id: song.id
                        },
                        data: {
                            albumOrder: startOrder + index * 10
                        }
                    })
                )
            );
            await tx.song.update({
                where: {
                    id: songId
                },
                data: {
                    albumOrder: startOrder + index * 10 - 10 / 2,
                    album: {
                        connect: {
                            id: album.id
                        }
                    }
                }
            });
            return;
        });
    },

    addSongs: async (
        album: Prisma.AlbumGetPayload<{
            include: { songs: true };
        }>,
        songIds: string[]
    ) => {
        const songs = album.songs.sort((a, b) => a.albumOrder! - b.albumOrder!);
        let startIndex = 0;
        if (songs.length != 0) {
            startIndex = songs[songs.length - 1].albumOrder! + 10;
        }
        await prismaClient.$transaction(
            songIds.map((id, index) =>
                prismaClient.song.update({
                    where: { id },
                    data: {
                        albumOrder: startIndex + index * 10,
                        album: {
                            connect: {
                                id: album.id
                            }
                        }
                    }
                })
            )
        );
    }
};
