import { Song } from "@prisma/client";

export type CreateSongDto = {
    name: string;
};

export type GetSongsDto = Partial<Pick<Song, "name" | "userId">> & {
    options?: {
        limit?: number;
        offset?: number;
    };
};
