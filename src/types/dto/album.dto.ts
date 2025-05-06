import { Album, Song } from "@prisma/client";

export type CreateAlbumDto = {
    name: string;
};

export type GetAlbumDto = Partial<Pick<Album, "id">> & {
    options?: {
        userProfile?: boolean;
        songs?: boolean;
    };
    userId?: string;
};

export type GetAlbumsDto = Partial<Pick<Album, "name" | "userId">> & {
    options?: {
        limit?: number;
        offset?: number;
        userProfiles?: boolean;
    };
    loginUserId?: string;
};

export type AlbumWithSongs = Album & {
    songs?: Song[];
};
