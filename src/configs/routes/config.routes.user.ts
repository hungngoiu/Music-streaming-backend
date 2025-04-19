import { defaultRoutesConfigProps } from "./config.routes.default.js";

interface userRouteConfigProps extends defaultRoutesConfigProps {
    uploadSong: string;
    createAlbum: string;
    addSong: string;
    setSongs: string;
}

export const userRouteConfig: userRouteConfigProps = {
    index: "/users",
    status: "/status",
    uploadSong: "/songs",
    createAlbum: "/albums",
    addSong: "/albums/:albumId/songs/:songId",
    setSongs: "/albums/:id"
};
