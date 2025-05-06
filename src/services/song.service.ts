import { CustomError } from "@/errors/index.js";
import {
    CreateSongDto,
    GetSongDto,
    GetSongsDto
} from "@/types/dto/song.dto.js";
import { Song } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import { storageService } from "./storage.service.js";
import { musicsBucketConfigs } from "@/configs/storage.config.js";
import { songRepo, userRepo } from "@/repositories/index.js";
import sharp from "sharp";
import { envConfig } from "@/configs/env.config.js";
import logger from "@/utils/logger.js";
interface SongServiceInterface {
    createSong: (
        data: CreateSongDto,
        userId: string,
        audioFile: Express.Multer.File,
        coverImg: Express.Multer.File
    ) => Promise<{ song: Song; coverImageUrl: string | null }>;
    getSong: (
        args: GetSongDto
    ) => Promise<{ song: Song; coverImageUrl: string | null }>;

    getSongs: (
        args: GetSongsDto
    ) => Promise<{ song: Song; coverImageUrl: string | null }[]>;

    getSongSignedAudioUrl: (id: string) => Promise<string | null>;
}

export const songService: SongServiceInterface = {
    createSong: async (
        data: CreateSongDto,
        userId: string,
        audioFile: Express.Multer.File,
        coverImg: Express.Multer.File
    ): Promise<{ song: Song; coverImageUrl: string | null }> => {
        const user = userRepo.getOneByFilter({ id: userId });
        if (!user) {
            throw new CustomError("User not found", StatusCodes.NOT_FOUND);
        }

        //Format the image before uploading
        const coverImgBuffer = await sharp(coverImg.buffer)
            .resize(1024, 1024, {
                fit: "contain"
            })
            .png()
            .toBuffer();

        const { success, filePaths } = await storageService.uploadMany(
            musicsBucketConfigs.name,
            [
                {
                    folder: musicsBucketConfigs.audioFolder.name,
                    buffer: audioFile.buffer
                },
                {
                    folder: musicsBucketConfigs.coverFolder.name,
                    buffer: coverImgBuffer
                }
            ]
        );
        if (!success) {
            throw new CustomError(
                "Failed to upload files",
                StatusCodes.INTERNAL_SERVER_ERROR
            );
        }
        const audioFilePath = filePaths[0];
        const coverImagePath = filePaths[1];
        try {
            const song = await songRepo.create({
                ...data,
                audioFilePath: audioFilePath,
                coverImagePath: coverImagePath,
                user: { connect: { id: userId } }
            });
            const coverImageUrl = await storageService.generateUrl(
                musicsBucketConfigs.name,
                song.coverImagePath,
                envConfig.IMAGE_URL_EXP
            );
            return { song, coverImageUrl };
        } catch (err) {
            await storageService.deleteMany(
                musicsBucketConfigs.name,
                filePaths
            );
            throw err;
        }
    },

    getSong: async (
        args: GetSongDto
    ): Promise<{
        song: Song;
        coverImageUrl: string | null;
    }> => {
        const { id, options } = args;
        const song = await songRepo.getOneByFilter(
            { id },
            {
                include: {
                    user: {
                        omit: {
                            password: true
                        },
                        include: {
                            ...options
                        }
                    }
                }
            }
        );
        if (!song) {
            throw new CustomError("Song not found", StatusCodes.NOT_FOUND);
        }
        const coverImageUrl = await storageService.generateUrl(
            musicsBucketConfigs.name,
            song.coverImagePath,
            envConfig.IMAGE_URL_EXP
        );
        return { song, coverImageUrl };
    },

    getSongs: async (
        args: GetSongsDto
    ): Promise<{ song: Song; coverImageUrl: string | null }[]> => {
        const { options, name, userId } = args;
        const { limit = 10, offset = 0 } = options ?? { undefined };
        const songs = await songRepo.searchSongs(
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
            }
        );
        return (
            await Promise.allSettled(
                songs.map(async (song) => {
                    try {
                        const coverImageUrl = await storageService.generateUrl(
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
    },

    getSongSignedAudioUrl: async (id: string) => {
        const song = await songRepo.getOneByFilter({ id });
        if (!song) {
            throw new CustomError("Song not found", StatusCodes.NOT_FOUND);
        }
        const audioUrl = await storageService.generateUrl(
            musicsBucketConfigs.name,
            song.audioFilePath,
            envConfig.MUCSIC_URL_EXP
        );
        return audioUrl;
    }
};
