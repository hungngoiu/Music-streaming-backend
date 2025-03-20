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
        data: Prisma.UserUpdateInput,
        options?: Omit<Prisma.UserUpdateArgs, "where" | "data">
    ): Promise<User> => {
        return prismaClient.user.update({
            where: filter,
            data: data,
            ...options
        });
    },

    /* ------------------------------ User Profiles ----------------------------- */

    createProfile: (
        data: Prisma.UserProfileCreateInput,
        options?: Omit<Prisma.UserProfileCreateArgs, "data">
    ): Promise<UserProfile> => {
        return prismaClient.userProfile.create({ data: data, ...options });
    },

    updateProfile: (
        filter: Prisma.UserProfileWhereUniqueInput,
        data: Prisma.UserProfileUpdateInput,
        options?: Omit<Prisma.UserProfileUpdateArgs, "where" | "data">
    ) => {
        return prismaClient.userProfile.update({
            where: filter,
            data: data,
            ...options
        });
    },
    getOneProfileByfilter: (
        filter: Prisma.UserProfileWhereInput,
        options?: Omit<Prisma.UserProfileFindFirstArgs, "where">
    ): Promise<UserProfile | null> => {
        return prismaClient.userProfile.findFirst({
            where: filter,
            ...options
        });
    },
    getAllProfileByFilter: (
        filter: Prisma.UserProfileWhereInput,
        options?: Omit<Prisma.UserProfileFindManyArgs, "where">
    ): Promise<UserProfile[]> => {
        return prismaClient.userProfile.findMany({ where: filter, ...options });
    }
};
