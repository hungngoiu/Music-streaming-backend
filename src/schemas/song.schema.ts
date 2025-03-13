import { z } from "zod";

export const uploadSongSchema = z.object({
    name: z.string().min(1, "Name required")
});
