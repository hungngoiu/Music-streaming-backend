import { CustomError } from "@/errors/index.js";
import { userRepo } from "@/repositories/user.repo.js";
import { CreateSongDto } from "@/types/dto/song.dto.js";
import { Song } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import { storageService } from "./storage.service.js";
import { musicsBucketConfigs } from "@/configs/storage.config.js";
import { songRepo } from "@/repositories/song.repo.js";
import logger from "@/utils/logger.js";
import sharp from "sharp";
interface songServiceInterface {
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
}

export const songService: songServiceInterface = {
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

        const results = await Promise.all([
            storageService.uploadOne(
                musicsBucketConfigs.name,
                musicsBucketConfigs.audioFolder.name,
                audioFile.buffer
            ),
            storageService.uploadOne(
                musicsBucketConfigs.name,
                musicsBucketConfigs.coverFolder.name,
                coverImgBuffer
            )
        ]);
        if (results[0].error || results[1].error) {
            const successUploadedFiles = results.filter((result) => {
                return result.error == null;
            });
            successUploadedFiles.forEach(async (result) => {
                const { error } = await storageService.deleteOne(
                    musicsBucketConfigs.name,
                    result.filePath
                );
                if (error) {
                    logger.error(
                        `Cannot delete ${result.filePath} in bucket {musicsBucketConfigs.name}`
                    );
                    //TO-DO
                    //Perform an approach to retry delete this orphan file in the future
                }
            });
            throw new CustomError(
                "Error uploading files",
                StatusCodes.INTERNAL_SERVER_ERROR
            );
        }
        const audioFilePath = results[0].filePath;
        const coverImagePath = results[1].filePath;
        let song: Song;
        try {
            song = await songRepo.createOne({
                ...data,
                audioFilePath: audioFilePath,
                coverImagePath: coverImagePath,
                user: { connect: { id: userId } }
            });
        } catch (err) {
            let { error } = await storageService.deleteOne(
                musicsBucketConfigs.name,
                audioFilePath
            );
            if (error) {
                logger.error(
                    `Cannot delete ${audioFilePath} in bucket {musicsBucketConfigs.name}`
                );
                //TO-DO
                //Perform an approach to retry delete this orphan file in the future
            }
            ({ error } = await storageService.deleteOne(
                musicsBucketConfigs.name,
                audioFilePath
            ));
            if (error) {
                logger.error(
                    `Cannot delete ${audioFilePath} in bucket {musicsBucketConfigs.name}`
                );
                //TO-DO
                //Perform an approach to retry delete this orphan file in the future
            }
            throw err;
        }

        const urls = await Promise.all([
            storageService.generateUrl(musicsBucketConfigs.name, audioFilePath),
            storageService.generateUrl(musicsBucketConfigs.name, coverImagePath)
        ]);
        return { song, audioUrl: urls[0], coverImageUrl: urls[1] };
    }
};
