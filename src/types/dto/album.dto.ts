import { Album, Song } from "@prisma/client";

export type CreateAlbumDto = {
    name: string;
};

export type GetAlbumDto = Partial<Pick<Album, "id">> & {
    options?: {
        userProfile?: boolean;
        songs?: boolean;
    };
};

export type AlbumWithSongs = Album & {
    songs?: Song[];
};
