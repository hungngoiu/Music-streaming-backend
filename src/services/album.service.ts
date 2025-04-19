import { AuthorizationError, CustomError } from "@/errors/index.js";
import { albumRepo, songRepo } from "@/repositories/index.js";
import { CreateAlbumDto } from "@/types/dto/index.js";
import { Album } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import sharp from "sharp";
import { storageService } from "./storage.service.js";
import { musicsBucketConfigs } from "@/configs/storage.config.js";
import { envConfig } from "@/configs/index.js";

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

        const songs = await songRepo.getManyByFilter(
            {
                id: {
                    in: songIds
                }
            },
            {
                select: {
                    id: true,
                    albumId: true
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
        const invalidSongIds = songs
            .filter((song) => {
                return song.albumId != null && song.albumId != albumId;
            })
            .map((song) => song.id)
            .join(", ");
        if (invalidSongIds.length != 0) {
            throw new CustomError(
                `The following songs are already assigned to another album: ${invalidSongIds}`,
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
        const album = await albumRepo.getOneByFilter({ id: albumId });
        const song = await songRepo.getOnebyFilter({ id: songId });
        if (!album) {
            throw new CustomError("Album not found", StatusCodes.NOT_FOUND);
        }
        if (userId != album.userId) {
            throw new AuthorizationError("Album not belong to user");
        }
        if (!song) {
            throw new CustomError("Song not found", StatusCodes.NOT_FOUND);
        }
        const { songAlreadyInAlbum } = await albumRepo.addSong(
            albumId,
            songId,
            index
        );

        if (songAlreadyInAlbum) {
            throw new CustomError(
                "The song is already existed in the album",
                StatusCodes.CONFLICT
            );
        }
    }
};
