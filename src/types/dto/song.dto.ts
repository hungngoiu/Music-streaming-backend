import { Song } from "@prisma/client";

export type CreateSongDto = {
    name: string;
};

export type GetSongDto = Pick<Song, "id">;

export type GetSongsDto = Partial<Pick<Song, "name" | "userId">> & {
    options?: {
        limit?: number;
        offset?: number;
    };
};
