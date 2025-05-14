import { CustomError } from "@/errors/index.js";
import { userRepo } from "@/repositories/index.js";
import { StatusCodes } from "http-status-codes";
import sharp from "sharp";
import { storageService } from "./storage.service.js";
import { usersBucketConfigs } from "@/configs/storage.config.js";
import { GetUsersDto, UpdateProfileDto, UserDto } from "@/types/dto/index.js";
import { Prisma, User } from "@prisma/client";
import { userModelToDto } from "@/utils/modelToDto.js";

interface UserServiceInterface {
    updateAvatar: (
        userId: string,
        avatar: Express.Multer.File
    ) => Promise<void>;
    updateProfile: (userId: string, data: UpdateProfileDto) => Promise<User>;
    getUser: (userId: string) => Promise<UserDto>;
    getUsers: (args: GetUsersDto) => Promise<UserDto[]>;
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
    },

    getUser: async (userId: string) => {
        const user = (await userRepo.getOneByFilter(
            { id: userId },
            { include: { userProfile: true } }
        )) as Prisma.UserGetPayload<{
            include: { userProfile: true };
        }>;
        if (!user) {
            throw new CustomError("User not found", StatusCodes.NOT_FOUND);
        }
        return userModelToDto(user);
    },

    getUsers: async (args: GetUsersDto): Promise<UserDto[]> => {
        const { options, name } = args;
        const { limit = 10, offset = 0 } = options ?? { undefined };
        const users = await userRepo.searchUsers(
            { name },
            {
                take: limit,
                skip: offset,
                include: {
                    userProfile: true
                }
            }
        );
        return (
            await Promise.allSettled(users.map((user) => userModelToDto(user)))
        )
            .filter((result) => result.status == "fulfilled")
            .map((result) => result.value);
    }
};
