import { Song } from "@prisma/client";

export type CreateSongDto = {
    name: string;
};

export type GetSongDto = Partial<Pick<Song, "id">> & {
    options?: {
        userProfiles?: boolean;
    };
};

export type GetSongsDto = Partial<Pick<Song, "name" | "userId">> & {
    options?: {
        limit?: number;
        offset?: number;
        userProfiles?: boolean;
    };
};
