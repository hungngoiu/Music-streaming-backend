import { CustomError } from "@/errors/index.js";
import { userRepo } from "@/repositories/user.repo.js";
import { CreateSongDto, GetSongsDto } from "@/types/dto/song.dto.js";
import { Song } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import { storageService } from "./storage.service.js";
import { musicsBucketConfigs } from "@/configs/storage.config.js";
import { songRepo } from "@/repositories/song.repo.js";
import sharp from "sharp";
import { omitPropsFromObject } from "@/utils/object.js";
interface SongServiceInterface {
    createSong: (
        data: CreateSongDto,
        userId: string,
        audioFile: Express.Multer.File,
        coverImg: Express.Multer.File
    ) => Promise<Song>;
    getSong: (
        id: string
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
    ): Promise<Song> => {
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
        let song: Song;
        try {
            song = await songRepo.createOne({
                ...data,
                audioFilePath: audioFilePath,
                coverImagePath: coverImagePath,
                user: { connect: { id: userId } }
            });
        } catch (err) {
            await storageService.deleteMany(
                musicsBucketConfigs.name,
                filePaths
            );
            throw err;
        }
        return song;
    },

    getSong: async (
        id: string
    ): Promise<{
        song: Song;
        coverImageUrl: string | null;
    }> => {
        const song = await songRepo.getOnebyFilter({ id });
        if (!song) {
            throw new CustomError("Song not found", StatusCodes.NOT_FOUND);
        }
        const coverImageUrl = await storageService.generateUrl(
            musicsBucketConfigs.name,
            song.coverImagePath
        );
        return { song, coverImageUrl };
    },

    getSongs: async (
        args: GetSongsDto
    ): Promise<{ song: Song; coverImageUrl: string | null }[]> => {
        const { options, name } = args;
        const filter = omitPropsFromObject(args, ["options", "name"]);
        const { limit = 10, offset = 0 } = options ?? { undefined };
        const songs = await songRepo.getManyByFilter(
            {
                ...filter,
                name: {
                    search: name ? name.replace(" ", "&") : undefined
                }
            },
            { take: limit <= 100 ? limit : 100, skip: offset }
        );
        return Promise.all(
            songs.map(async (song) => {
                const coverImageUrl = await storageService.generateUrl(
                    musicsBucketConfigs.name,
                    song.coverImagePath,
                    60 * 60 * 24
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
            60 * 15
        );
        return audioUrl;
    }
};
