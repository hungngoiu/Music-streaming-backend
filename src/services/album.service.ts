import { AuthorizationError, CustomError } from "@/errors/index.js";
import { albumRepo, songRepo } from "@/repositories/index.js";
import {
    CreateAlbumDto,
    GetAlbumDto,
    GetAlbumsDto
} from "@/types/dto/index.js";
import { Album, Prisma, Song } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import sharp from "sharp";
import { storageService } from "./storage.service.js";
import { musicsBucketConfigs } from "@/configs/storage.config.js";
import { envConfig } from "@/configs/index.js";
import logger from "@/utils/logger.js";
import { omitPropsFromObject } from "@/utils/object.js";
import { getDuplicates } from "@/utils/array.js";

interface AlbumServiceInterface {
    createAlbum: (
        data: CreateAlbumDto,
        userId: string,
        coverImg: Express.Multer.File
    ) => Promise<{ album: Album; coverImageUrl: string | null }>;
    setSongs: (
        albumId: string,
        songIds: string[],
        userId: string
    ) => Promise<void>;

    addSong: (
        albumId: string,
        songId: string,
        userId: string,
        index?: number
    ) => Promise<void>;

    addSongs: (
        albumId: string,
        songIds: string[],
        userId: string
    ) => Promise<void>;

    getAlbum: (args: GetAlbumDto) => Promise<{
        album: Album & {
            songsWithImageUrl?: { song: Song; coverImageUrl: string | null }[];
        };
        coverImageUrl: string | null;
    }>;

    getAlbums: (
        args: GetAlbumsDto
    ) => Promise<{ album: Album; coverImageUrl: string | null }[]>;

    publicAlbum: (albumId: string, userId: string) => Promise<void>;
}

export const albumService: AlbumServiceInterface = {
    createAlbum: async (
        data: CreateAlbumDto,
        userId: string,
        coverImg: Express.Multer.File
    ): Promise<{ album: Album; coverImageUrl: string | null }> => {
        const user = albumRepo.getOneByFilter({ id: userId });
        if (!user) {
            throw new CustomError("User not found", StatusCodes.NOT_FOUND);
        }

        const coverImgBuffer = await sharp(coverImg.buffer)
            .resize(1400, 1400, {
                fit: "contain"
            })
            .png()
            .toBuffer();

        const coverImagePath = await storageService.uploadOne(
            musicsBucketConfigs.name,
            musicsBucketConfigs.audioFolder.name,
            coverImgBuffer
        );
        try {
            const album = await albumRepo.create({
                ...data,
                coverImagePath: coverImagePath,
                user: { connect: { id: userId } }
            });
            const coverImageUrl = await storageService.generateUrl(
                musicsBucketConfigs.name,
                album.coverImagePath,
                envConfig.IMAGE_URL_EXP
            );
            return { album, coverImageUrl };
        } catch (err) {
            await storageService.deleteOne(
                musicsBucketConfigs.name,
                coverImagePath
            );
            throw err;
        }
    },

    setSongs: async (
        albumId: string,
        songIds: string[],
        userId: string
    ): Promise<void> => {
        const album = await albumRepo.getOneByFilter({ id: albumId });
        if (!album) {
            throw new CustomError("Album not found", StatusCodes.NOT_FOUND);
        }
        if (userId != album.userId) {
            throw new AuthorizationError("Album not belong to user");
        }
        const duplicatesIds = getDuplicates(songIds);
        if (duplicatesIds.length != 0) {
            throw new CustomError(
                "There are duplicate ids in the list",
                StatusCodes.BAD_REQUEST
            );
        }
        const songs = await songRepo.getManyByFilter(
            {
                id: {
                    in: songIds
                }
            },
            {
                select: {
                    id: true,
                    albumId: true,
                    userId: true
                }
            }
        );
        const notFoundSongIds = songIds.filter(
            (id) => !songs.map((song) => song.id).includes(id)
        );
        if (notFoundSongIds.length != 0) {
            throw new CustomError(
                `The following songs are not exist: ${notFoundSongIds}`,
                StatusCodes.NOT_FOUND
            );
        }
        const notBelongToUserSongs = songs.filter(
            (song) => song.userId != userId
        );
        if (notBelongToUserSongs.length != 0) {
            console.log(userId);
            throw new AuthorizationError(
                `The following songs are not belong to user: ${notBelongToUserSongs.map((song) => song.id)}`
            );
        }
        const assignedSongIds = songs
            .filter((song) => {
                return song.albumId != null && song.albumId != albumId;
            })
            .map((song) => song.id);
        if (assignedSongIds.length != 0) {
            throw new CustomError(
                `The following songs are already assigned to another album: ${assignedSongIds}`,
                StatusCodes.BAD_REQUEST
            );
        }
        await albumRepo.connectSongs(albumId, songIds);
    },

    addSong: async (
        albumId: string,
        songId: string,
        userId: string,
        index?: number
    ): Promise<void> => {
        const album = (await albumRepo.getOneByFilter(
            { id: albumId },
            {
                include: {
                    songs: true
                }
            }
        )) as Prisma.AlbumGetPayload<{
            include: { songs: true };
        }> | null;

        const song = await songRepo.getOneByFilter({ id: songId });
        if (!album) {
            throw new CustomError("Album not found", StatusCodes.NOT_FOUND);
        }
        if (userId != album.userId) {
            throw new AuthorizationError("Album not belong to user");
        }
        if (!song) {
            throw new CustomError("Song not found", StatusCodes.NOT_FOUND);
        }
        if (song.userId != userId) {
            throw new AuthorizationError("Song not belong to user");
        }
        if (album.songs.map((song) => song.id).includes(songId)) {
            throw new CustomError(
                "The song is already existed in the album",
                StatusCodes.CONFLICT
            );
        }
        await albumRepo.addSong(album, songId, index);
    },

    addSongs: async (albumId: string, songIds: string[], userId: string) => {
        const album = (await albumRepo.getOneByFilter(
            { id: albumId },
            { include: { songs: true } }
        )) as Prisma.AlbumGetPayload<{
            include: { songs: true };
        }> | null;
        if (!album) {
            throw new CustomError("Album not found", StatusCodes.NOT_FOUND);
        }
        if (userId != album.userId) {
            throw new AuthorizationError("Album not belong to user");
        }
        const duplicatesIds = getDuplicates(songIds);
        if (duplicatesIds.length != 0) {
            throw new CustomError(
                "There are duplicate ids in the list",
                StatusCodes.BAD_REQUEST
            );
        }
        const songs = await songRepo.getManyByFilter(
            {
                id: {
                    in: songIds
                }
            },
            {
                select: {
                    id: true,
                    albumId: true,
                    userId: true
                }
            }
        );
        const notFoundSongIds = songIds.filter(
            (id) => !songs.map((song) => song.id).includes(id)
        );
        if (notFoundSongIds.length != 0) {
            throw new CustomError(
                `The following songs are not exist: ${notFoundSongIds}`,
                StatusCodes.NOT_FOUND
            );
        }
        const notBelongToUserSongs = songs.filter(
            (song) => song.userId != userId
        );
        if (notBelongToUserSongs.length != 0) {
            throw new AuthorizationError(
                `The following songs are not belong to user: ${notBelongToUserSongs.map((song) => song.id)}`
            );
        }
        const assginedSongIds = songs
            .filter((song) => {
                return song.albumId != null && song.albumId != albumId;
            })
            .map((song) => song.id);
        if (assginedSongIds.length != 0) {
            throw new CustomError(
                `The following songs are already assigned to another album: ${assginedSongIds}`,
                StatusCodes.BAD_REQUEST
            );
        }
        const unassignedSongIds = songs
            .filter((song) => !song.albumId)
            .map((song) => song.id);
        await albumRepo.addSongs(album, unassignedSongIds);
    },

    getAlbum: async (args: GetAlbumDto) => {
        const { id, options, userId } = args;
        const album = await albumRepo.getOneByFilter(
            {
                id,
                OR: [
                    {
                        userId
                    },
                    { isPublic: true }
                ]
            },
            {
                include: {
                    user: {
                        omit: {
                            password: true
                        },
                        include: {
                            userProfile: options?.userProfile
                        }
                    },
                    songs: options?.songs
                        ? {
                              orderBy: {
                                  albumOrder: "asc"
                              }
                          }
                        : undefined
                }
            }
        );
        if (!album) {
            throw new CustomError("Album not found", StatusCodes.NOT_FOUND);
        }
        let songsWithImageUrl = undefined;
        if (album.songs) {
            songsWithImageUrl = (
                await Promise.allSettled(
                    album.songs.map(async (song) => {
                        try {
                            const coverImageUrl =
                                await storageService.generateUrl(
                                    musicsBucketConfigs.name,
                                    song.coverImagePath,
                                    envConfig.IMAGE_URL_EXP
                                );
                            return { song, coverImageUrl };
                        } catch (err) {
                            if (err instanceof Error) {
                                logger.warn(err.message);
                            } else {
                                logger.warn(
                                    "Caught unknown error when retrieving song image url"
                                );
                            }
                            throw err;
                        }
                    })
                )
            )
                .filter((result) => result.status == "fulfilled")
                .map((result) => result.value);
        }
        const coverImageUrl = await storageService.generateUrl(
            musicsBucketConfigs.name,
            album.coverImagePath,
            envConfig.IMAGE_URL_EXP
        );
        return {
            album: {
                ...omitPropsFromObject(album, "songs"),
                songsWithImageUrl: songsWithImageUrl
            },
            coverImageUrl
        };
    },

    getAlbums: async (
        args: GetAlbumsDto
    ): Promise<{ album: Album; coverImageUrl: string | null }[]> => {
        const { options, name, userId, loginUserId } = args;
        const { limit = 10, offset = 0 } = options ?? { undefined };
        const albums = await albumRepo.searchAlbums(
            { name, userId },
            {
                take: limit,
                skip: offset,
                include: {
                    user: {
                        omit: {
                            password: true
                        },
                        include: {
                            userProfile: options?.userProfiles
                        }
                    }
                }
            },
            loginUserId
        );
        return (
            await Promise.allSettled(
                albums.map(async (album) => {
                    try {
                        const coverImageUrl = await storageService.generateUrl(
                            musicsBucketConfigs.name,
                            album.coverImagePath,
                            envConfig.IMAGE_URL_EXP
                        );
                        return { album, coverImageUrl };
                    } catch (err) {
                        if (err instanceof Error) {
                            logger.warn(err.message);
                        } else {
                            logger.warn(
                                "Caught unknown error when retrieving song image url"
                            );
                        }
                        throw err;
                    }
                })
            )
        )
            .filter((result) => result.status == "fulfilled")
            .map((result) => result.value);
    },
    publicAlbum: async (albumId: string, userId: string): Promise<void> => {
        const album = await albumRepo.getOneByFilter({ id: albumId });
        if (!album) {
            throw new CustomError("Album not found", StatusCodes.NOT_FOUND);
        }
        if (userId != album.userId) {
            throw new AuthorizationError("Album not belong to user");
        }
        if (album.isPublic) {
            throw new CustomError(
                "Album is already public",
                StatusCodes.CONFLICT
            );
        }
        await albumRepo.update({ id: albumId }, { isPublic: true });
    }
};
