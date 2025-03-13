import { CustomError } from "@/errors/index.js";
import { userRepo } from "@/repositories/user.repo.js";
import { createSongDto } from "@/types/dto/song.dto.js";
import { Song } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import { storageService } from "./storage.service.js";
import { audioBucketConfigs } from "@/configs/storage.config.js";
import { songRepo } from "@/repositories/song.repo.js";

interface songServiceInterface {
    createSong: (
        data: createSongDto,
        userId: string,
        file: Express.Multer.File
    ) => Promise<{ song: Song; url: string | null }>;
}

export const songService: songServiceInterface = {
    createSong: async (
        data: createSongDto,
        userId: string,
        file: Express.Multer.File
    ): Promise<{ song: Song; url: string | null }> => {
        const user = userRepo.getOneByFilter({ id: userId });
        if (!user) {
            throw new CustomError("User not found", StatusCodes.NOT_FOUND);
        }
        const path = await storageService.uploadOne(
            audioBucketConfigs.name,
            audioBucketConfigs.musicFolder,
            file
        );
        let song: Song;
        try {
            song = await songRepo.createOne({
                ...data,
                path: path,
                user: { connect: { id: userId } }
            });
        } catch (err) {
            await storageService.deleteOne(audioBucketConfigs.name, path);
            throw err;
        }
        const url = await storageService.generateUrl(
            audioBucketConfigs.name,
            path
        );
        return { song, url };
    }
};
