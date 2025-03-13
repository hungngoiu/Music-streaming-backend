import prismaClient from "@/databases/prisma.js";
import { Prisma } from "@prisma/client";

export const songRepo = {
    createOne: (
        data: Prisma.SongCreateInput,
        options?: Omit<Prisma.SongCreateArgs, "data">
    ) => {
        return prismaClient.song.create({
            data: data,
            ...options
        });
    }
};
