import { defaultRoutesConfigProps } from "./config.routes.default.js";

interface albumRouteConfigProps extends defaultRoutesConfigProps {
    createAlbum: string;
    addSong: string;
    addSongs: string;
    setSongs: string;
    publicAlbum: string;
    likeAlbum: string;
    unlikeAlbum: string;
    likeStatus: string;
    getAlbum: string;
    getAlbums: string;
}

export const albumRouteConfig: albumRouteConfigProps = {
    index: "/albums",
    status: "/status",
    createAlbum: "/",
    addSong: "/:albumId/songs/insert/:songId",
    addSongs: "/:albumId/songs/append",
    setSongs: "/:albumId/songs/set",
    publicAlbum: "/:id/public",
    likeAlbum: "/:id/like",
    unlikeAlbum: "/:id/unlike",
    likeStatus: "/:id/like-status",
    getAlbum: "/:id",
    getAlbums: "/many"
};
