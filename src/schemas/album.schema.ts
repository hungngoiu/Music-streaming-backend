import { z } from "zod";

export const uploadAlbumSchema = z.object({
    name: z.string().min(1, "Name required")
});

export const setSongsSchema = z.array(z.string());

export const addSongSchema = z.object({
    index: z.number().nonnegative("The index must not be negative").optional()
});

export const addSongsSchema = z.array(z.string());
