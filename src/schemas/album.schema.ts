import { booleanSchema } from "@/utils/zod.js";
import { z } from "zod";

export const uploadAlbumSchema = z.object({
    name: z.string().min(1, "Name required")
});

export const setSongsSchema = z.array(z.string());

export const addSongSchema = z.object({
    index: z.number().nonnegative("The index must not be negative").optional()
});

export const addSongsSchema = z.array(z.string());

export const getAlbumQuerySchema = z.object({
    userProfile: booleanSchema.optional(),
    songs: booleanSchema.optional()
});

export const getAlbumsQuerySchema = z.object({
    name: z.string().optional(),
    userId: z.string().optional(),
    limit: z.coerce
        .number({ message: "The limit must be an integer" })
        .int("The limit must be an integer")
        .positive("The limit must be positive")
        .optional(),
    offset: z.coerce
        .number({ message: "The offset must be an integer" })
        .int("The offset must be an integer")
        .min(0, "The offset must not be negative")
        .optional(),
    userProfiles: booleanSchema.optional()
});
