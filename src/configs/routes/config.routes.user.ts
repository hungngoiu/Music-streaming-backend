import { defaultRoutesConfigProps } from "./config.routes.default.js";

interface userRouteConfigProps extends defaultRoutesConfigProps {
    updateAvatar: string;
    updateProfile: string;
    getUser: string;
    getUsers: string;
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
    updateProfile: "/profiles",
    getUser: "/:id",
    getUsers: "/many",
    uploadSong: "/songs",
    createAlbum: "/albums",
    addSong: "/albums/:albumId/songs/insert/:songId",
    addSongs: "/albums/:albumId/songs/append",
    setSongs: "/albums/:albumId/songs/set",
    publicAlbum: "/albums/:id/public"
};
