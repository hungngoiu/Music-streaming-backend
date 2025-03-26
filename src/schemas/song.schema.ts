import { z } from "zod";

export const uploadSongSchema = z.object({
    name: z.string().min(1, "Name required")
});

export const getSongsSchema = z.object({
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
    userProfiles: z.coerce.boolean().optional()
});

export const getSongQuerySchema = z.object({
    userProfiles: z.coerce.boolean().optional()
});
