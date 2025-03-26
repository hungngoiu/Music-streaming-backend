import { CustomError } from "@/errors/index.js";
import { userRepo } from "@/repositories/user.repo.js";
import {
    CreateSongDto,
    GetSongDto,
    GetSongsDto
} from "@/types/dto/song.dto.js";
import { Song } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import { storageService } from "./storage.service.js";
import { musicsBucketConfigs } from "@/configs/storage.config.js";
import { songRepo } from "@/repositories/song.repo.js";
import sharp from "sharp";
import { envConfig } from "@/configs/env.config.js";
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
            .resize(1400, 1400, {
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
            const song = await songRepo.createOne({
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
        const song = await songRepo.getOnebyFilter(
            { id },
            {
                include: {
                    user: {
                        omit: {
                            password: true
                        },
                        include: {
                            userProfile: options?.userProfiles ?? false
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
                            userProfile: options?.userProfiles ?? false
                        }
                    }
                }
            }
        );
        return Promise.all(
            songs.map(async (song) => {
                const coverImageUrl = await storageService.generateUrl(
                    musicsBucketConfigs.name,
                    song.coverImagePath,
                    envConfig.IMAGE_URL_EXP
                );
                return { song, coverImageUrl };
            })
        );
    },

    getSongSignedAudioUrl: async (id: string) => {
        const song = await songRepo.getOnebyFilter({ id });
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
