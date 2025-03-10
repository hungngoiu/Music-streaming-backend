import prismaClient from "@/databases/prisma.js";
import { Prisma, User, UserProfile } from "@prisma/client";

export const userRepo = {
    /* ---------------------------------- User ---------------------------------- */
    getOneByFilter: (
        filter: Prisma.UserWhereInput,
        options?: Omit<Prisma.UserFindFirstArgs, "where">
    ): Promise<User | null> => {
        return prismaClient.user.findFirst({
            where: filter,
            ...options
        });
    },
    getAllByFilter: (
        filter: Prisma.UserWhereInput,
        options?: Omit<Prisma.UserFindManyArgs, "where">
    ): Promise<User[]> => {
        return prismaClient.user.findMany({
            where: filter,
            ...options
        });
    },
    create: (
        data: Prisma.UserCreateInput,
        options?: Omit<Prisma.UserCreateArgs, "data">
    ): Promise<User> => {
        return prismaClient.user.create({
            data: data,
            ...options
        });
    },
    update: (
        filter: Prisma.UserWhereUniqueInput,
        data: Prisma.UserUpdateInput
    ): Promise<User> => {
        return prismaClient.user.update({
            where: filter,
            data: data
        });
    },

    /* ------------------------------ User Profiles ----------------------------- */

    createProfile: (
        data: Prisma.UserProfileCreateInput
    ): Promise<UserProfile> => {
        return prismaClient.userProfile.create({ data: data });
    },
    updateProfile: (
        filter: Prisma.UserProfileWhereUniqueInput,
        data: Prisma.UserProfileUpdateInput
    ) => {
        return prismaClient.userProfile.update({
            where: filter,
            data: data
        });
    },
    getOneProfileByfilter: (
        filter: Prisma.UserProfileWhereInput
    ): Promise<UserProfile | null> => {
        return prismaClient.userProfile.findFirst({ where: filter });
    },
    getAllProfileByFilter: (
        filter: Prisma.UserProfileWhereInput
    ): Promise<UserProfile[]> => {
        return prismaClient.userProfile.findMany({ where: filter });
    }
};
