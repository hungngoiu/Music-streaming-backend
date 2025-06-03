import { Playlist } from "@prisma/client";
import { UserDto } from "./user.dto.js";

export type PlaylistDto = Omit<Playlist, "coverImagePath"> & {
    coverImageUrl: string | null;
    user?: UserDto;
};

export type CreatePlaylistDto = {
    name: string;
};
