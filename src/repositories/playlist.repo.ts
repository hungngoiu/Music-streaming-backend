import { Prisma } from "@prisma/client";
import prismaClient from "@/databases/prisma.js";

export const playlistRepo = {
    create: (
        data: Prisma.PlaylistCreateInput,
        options?: Omit<Prisma.PlaylistCreateArgs, "data">
    ) => {
        return prismaClient.playlist.create({
            data,
            ...options
        });
    },

    getOneByFilter: (
        filter: Prisma.PlaylistWhereInput,
        options?: Omit<Prisma.PlaylistFindFirstArgs, "where">
    ) => {
        return prismaClient.playlist.findFirst({ where: filter, ...options });
    },

    update: (
        filter: Prisma.PlaylistWhereUniqueInput,
        data: Prisma.PlaylistUpdateInput,
        options?: Omit<Prisma.PlaylistUpdateArgs, "data" | "where">
    ) => {
        return prismaClient.playlist.update({
            where: filter,
            data,
            ...options
        });
    },

    delete: (
        filter: Prisma.PlaylistWhereUniqueInput,
        options?: Omit<Prisma.PlaylistDeleteArgs, "where">
    ) => {
        return prismaClient.playlist.delete({
            where: filter,
            ...options
        });
    }
};
