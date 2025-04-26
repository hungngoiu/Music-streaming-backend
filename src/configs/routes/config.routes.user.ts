import { defaultRoutesConfigProps } from "./config.routes.default.js";

interface userRouteConfigProps extends defaultRoutesConfigProps {
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
    uploadSong: "/songs",
    createAlbum: "/albums",
    addSong: "/albums/:albumId/songs/:songId",
    addSongs: "/albums/:albumId/songs",
    setSongs: "/albums/:id",
    publicAlbum: "/albums/:id/public"
};
