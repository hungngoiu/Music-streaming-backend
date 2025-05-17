import { CustomError } from "@/errors/index.js";
import {
    CreateSongDto,
    GetSongDto,
    GetSongsDto,
    SongDto
} from "@/types/dto/song.dto.js";
import { StatusCodes } from "http-status-codes";
import { storageService } from "./storage.service.js";
import { musicsBucketConfigs } from "@/configs/storage.config.js";
import { songRepo, userRepo } from "@/repositories/index.js";
import sharp from "sharp";
import { envConfig } from "@/configs/env.config.js";
import { songModelToDto } from "@/utils/modelToDto.js";
import stableStringify from "json-stable-stringify";
import { cacheOrFetch } from "@/utils/caching.js";
import { namespaces } from "@/configs/redis.config.js";
import { redisService } from "./index.js";
interface SongServiceInterface {
    createSong: (
        data: CreateSongDto,
        userId: string,
        audioFile: Express.Multer.File,
        coverImg: Express.Multer.File
    ) => Promise<SongDto>;
    getSong: (args: GetSongDto) => Promise<SongDto>;

    getSongs: (args: GetSongsDto) => Promise<SongDto[]>;

    getSongSignedAudioUrl: (id: string) => Promise<string | null>;
}

export const songService: SongServiceInterface = {
    createSong: async (
        data: CreateSongDto,
        userId: string,
        audioFile: Express.Multer.File,
        coverImg: Express.Multer.File
    ): Promise<SongDto> => {
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
            return songModelToDto(song);
        } catch (err) {
            await storageService.deleteMany(
                musicsBucketConfigs.name,
                filePaths
            );
            throw err;
        }
    },

    getSong: async (args: GetSongDto): Promise<SongDto> => {
        const { id, options } = args;
        const cacheKey = `${id}:${stableStringify(options)}`;
        const { data: song, cacheHit } = await cacheOrFetch(
            namespaces.Song,
            cacheKey,
            () =>
                songRepo.getOneByFilter(
                    { id },
                    {
                        omit: {
                            albumOrder: true
                        },
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
                )
        );
        if (!cacheHit) {
            redisService.setAdd(
                {
                    namespace: namespaces.Song,
                    key: id,
                    members: [stableStringify(options)!]
                },
                { EX: envConfig.REDIS_CACHING_EXP }
            );
        }
        if (!song) {
            throw new CustomError("Song not found", StatusCodes.NOT_FOUND);
        }

        return songModelToDto(song);
    },

    getSongs: async (args: GetSongsDto): Promise<SongDto[]> => {
        const { options, name, userId } = args;
        const { limit = 10, offset = 0 } = options ?? { undefined };
        const songs = await songRepo.searchSongs(
            { name, userId },
            {
                take: limit,
                skip: offset,
                omit: {
                    albumOrder: true
                },
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
            await Promise.allSettled(songs.map((song) => songModelToDto(song)))
        )
            .filter((result) => result.status == "fulfilled")
            .map((result) => result.value);
    },

    getSongSignedAudioUrl: async (id: string) => {
        const song = await songRepo.getOneByFilter({ id });
        if (!song) {
            throw new CustomError("Song not found", StatusCodes.NOT_FOUND);
        }
        const cacheKey = `${musicsBucketConfigs.name}:${musicsBucketConfigs.audioFolder}:${song.audioFilePath}`;
        const { data: audioUrl } = await cacheOrFetch(
            namespaces.Filepath,
            cacheKey,
            () =>
                storageService.generateUrl(
                    musicsBucketConfigs.name,
                    song.audioFilePath,
                    envConfig.MUCSIC_URL_EXP
                )
        );
        return audioUrl;
    }
};
