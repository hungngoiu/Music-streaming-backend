import { defaultRoutesConfigProps } from "./config.routes.default.js";

interface userRouteConfigProps extends defaultRoutesConfigProps {
    uploadSong: string;
    createAlbum: string;
    setSongs: string;
}

export const userRouteConfig: userRouteConfigProps = {
    index: "/users",
    status: "/status",
    uploadSong: "/songs",
    createAlbum: "/albums",
    setSongs: "/albums/:id"
};
