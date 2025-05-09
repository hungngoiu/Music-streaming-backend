import { CustomError } from "@/errors/index.js";
import { userRepo } from "@/repositories/index.js";
import { StatusCodes } from "http-status-codes";
import sharp from "sharp";
import { storageService } from "./storage.service.js";
import { usersBucketConfigs } from "@/configs/storage.config.js";
import { UpdateProfileDto } from "@/types/dto/user.dto.js";
import { User } from "@prisma/client";

interface UserServiceInterface {
    updateAvatar: (
        userId: string,
        avatar: Express.Multer.File
    ) => Promise<void>;

    updateProfile: (userId: string, data: UpdateProfileDto) => Promise<User>;
}

export const userService: UserServiceInterface = {
    updateAvatar: async (userId: string, avatar: Express.Multer.File) => {
        const userProfile = await userRepo.getOneProfileByfilter({
            userId: userId
        });
        if (!userProfile) {
            throw new CustomError("User not found", StatusCodes.NOT_FOUND);
        }

        //Format the image before uploading
        const avatarBuffer = await sharp(avatar.buffer)
            .resize(512, 512, {
                fit: "contain"
            })
            .png()
            .toBuffer();

        const oldAvatarImagePath = userProfile.avatarImagePath;
        const avatarImagePath = await storageService.uploadOne(
            usersBucketConfigs.name,
            usersBucketConfigs.avatarFolder.name,
            avatarBuffer
        );

        try {
            await userRepo.updateProfile(
                { id: userProfile.id },
                { avatarImagePath }
            );
        } catch (err) {
            await storageService.deleteOne(
                usersBucketConfigs.name,
                avatarImagePath
            );
            throw err;
        }
        if (oldAvatarImagePath) {
            await storageService.deleteOne(
                usersBucketConfigs.name,
                oldAvatarImagePath
            );
        }
    },
    updateProfile: async (userId: string, data: UpdateProfileDto) => {
        const userProfile = await userRepo.getOneProfileByfilter({
            userId: userId
        });
        if (!userProfile) {
            throw new CustomError("User not found", StatusCodes.NOT_FOUND);
        }
        return await userRepo.update(
            { id: userId },
            {
                userProfile: {
                    update: data
                }
            },
            {
                include: {
                    userProfile: {
                        omit: {
                            avatarImagePath: true
                        }
                    }
                }
            }
        );
    }
};
