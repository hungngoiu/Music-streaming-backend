import { Album, Prisma } from "@prisma/client";
import prismaClient from "@/databases/prisma.js";

export const albumRepo = {
    create: (
        data: Prisma.AlbumCreateInput,
        options?: Omit<Prisma.AlbumCreateArgs, "data">
    ): Promise<Album> => {
        return prismaClient.album.create({
            data,
            ...options
        });
    },

    getOneByFilter: (
        filter: Prisma.AlbumWhereInput,
        options?: Omit<Prisma.AlbumFindFirstArgs, "where">
    ): Promise<Album | null> => {
        return prismaClient.album.findFirst({ where: filter, ...options });
    },

    update: (
        filter: Prisma.AlbumWhereUniqueInput,
        data: Prisma.AlbumUpdateInput,
        options?: Omit<Prisma.AlbumUpdateArgs, "data" | "where">
    ): Promise<Album> => {
        return prismaClient.album.update({
            where: filter,
            data,
            ...options
        });
    },

    delete: (
        filter: Prisma.AlbumWhereUniqueInput,
        options?: Omit<Prisma.AlbumDeleteArgs, "where">
    ): Promise<Album> => {
        return prismaClient.album.delete({
            where: filter,
            ...options
        });
    }
};
