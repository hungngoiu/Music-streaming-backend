import { musicsBucketConfigs } from "@/configs/storage.config.js";
import { CreatePlaylistDto, PlaylistDto } from "@/types/dto/index.js";
import sharp from "sharp";
import { storageService } from "./storage.service.js";
import { Prisma } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import { AuthenticationError } from "@/errors/index.js";
import { playlistRepo } from "@/repositories/index.js";
import { playlistModelToDto } from "@/utils/modelToDto.js";

interface PlaylistServiceInterface {
    createPlaylist: (
        data: CreatePlaylistDto,
        userId: string,
        coverImg?: Express.Multer.File
    ) => Promise<PlaylistDto>;
}

export const playlistService: PlaylistServiceInterface = {
    createPlaylist: async (
        data: CreatePlaylistDto,
        userId: string,
        coverImg?: Express.Multer.File
    ) => {
        let coverImagePath: string | null = null;
        if (!coverImg) {
            try {
                const album = await playlistRepo.create({
                    ...data,
                    user: { connect: { id: userId } }
                });
                return playlistModelToDto(album);
            } catch (err) {
                if (
                    err instanceof Prisma.PrismaClientKnownRequestError &&
                    err.code == "P2003"
                ) {
                    throw new AuthenticationError(
                        "User not found",
                        StatusCodes.UNAUTHORIZED
                    );
                }
                throw err;
            }
        }
        const coverImgBuffer = await sharp(coverImg.buffer)
            .resize(1024, 1024, {
                fit: "contain"
            })
            .png()
            .toBuffer();

        coverImagePath = await storageService.uploadOne(
            musicsBucketConfigs.name,
            musicsBucketConfigs.coverFolder.name,
            coverImgBuffer
        );
        try {
            const album = await playlistRepo.create({
                ...data,
                coverImagePath: coverImagePath,
                user: { connect: { id: userId } }
            });
            return playlistModelToDto(album);
        } catch (err) {
            await storageService.deleteOne(
                musicsBucketConfigs.name,
                coverImagePath
            );
            if (
                err instanceof Prisma.PrismaClientKnownRequestError &&
                err.code == "P2003"
            ) {
                throw new AuthenticationError(
                    "User not found",
                    StatusCodes.UNAUTHORIZED
                );
            }
            throw err;
        }
    }
};
