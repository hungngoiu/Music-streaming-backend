import { z } from "zod";

export const uploadAlbumSchema = z.object({
    name: z.string().min(1, "Name required")
});

export const setSongsSchema = z.array(z.string());
