import { defaultRoutesConfigProps } from "./config.routes.default.js";

interface userRouteConfigProps extends defaultRoutesConfigProps {
    updateAvatar: string;
    uploadSong: string;
    createAlbum: string;
    addSong: string;
    addSongs: string;
    setSongs: string;
    publicAlbum: string;
}

export const userRouteConfig: userRouteConfigProps = {
    index: "/users",
    status: "/status",
    updateAvatar: "/profiles/avatar",
    uploadSong: "/songs",
    createAlbum: "/albums",
    addSong: "/albums/:albumId/songs/:songId",
    addSongs: "/albums/:albumId/songs",
    setSongs: "/albums/:albumId/songs",
    publicAlbum: "/albums/:id/public"
};
