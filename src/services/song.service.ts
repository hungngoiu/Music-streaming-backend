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
import { omitPropsFromObject } from "@/utils/object.js";
interface SongServiceInterface {
    createSong: (
        data: CreateSongDto,
        userId: string,
        audioFile: Express.Multer.File,
        coverImg: Express.Multer.File
    ) => Promise<{
        song: Song;
        audioUrl: string | null;
        coverImageUrl: string | null;
    }>;
    getSong: (filter: GetSongDto) => Promise<Song | null>;

    getSongs: (args: GetSongsDto) => Promise<Song[]>;
}

export const songService: SongServiceInterface = {
    createSong: async (
        data: CreateSongDto,
        userId: string,
        audioFile: Express.Multer.File,
        coverImg: Express.Multer.File
    ): Promise<{
        song: Song;
        audioUrl: string | null;
        coverImageUrl: string | null;
    }> => {
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
        const urls = await Promise.all([
            storageService.generateUrl(musicsBucketConfigs.name, audioFilePath),
            storageService.generateUrl(musicsBucketConfigs.name, coverImagePath)
        ]);
        return { song, audioUrl: urls[0], coverImageUrl: urls[1] };
    },

    getSong: (filter: GetSongDto): Promise<Song | null> => {
        return songRepo.getOnebyFilter(filter);
    },

    getSongs: (args: GetSongsDto): Promise<Song[]> => {
        const { options, name } = args;
        const filter = omitPropsFromObject(args, ["options", "name"]);
        const { limit = 10, offset = 0 } = options ?? { undefined };
        return songRepo.getManyByFilter(
            {
                ...filter,
                name: {
                    search: name ? name.replace(" ", "&") : undefined
                }
            },
            { take: limit <= 100 ? limit : 100, skip: offset }
        );
    }
};
