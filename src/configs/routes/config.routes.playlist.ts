import { defaultRoutesConfigProps } from "./config.routes.default.js";

interface playlistRouteConfigProps extends defaultRoutesConfigProps {
    createPlaylist: string;
}

export const playlistRouteConfig: playlistRouteConfigProps = {
    index: "/playlists",
    status: "/status",
    createPlaylist: "/"
};
