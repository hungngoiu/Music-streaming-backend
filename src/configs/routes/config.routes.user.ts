import { defaultRoutesConfigProps } from "./config.routes.default.js";

interface userRouteConfigProps extends defaultRoutesConfigProps {
    updateAvatar: string;
    updateProfile: string;
    getUser: string;
    getUsers: string;
    getUserLikedSong: string;
}

export const userRouteConfig: userRouteConfigProps = {
    index: "/users",
    status: "/status",
    updateAvatar: "/me/profiles/avatar",
    updateProfile: "/profiles",
    getUser: "/:id",
    getUsers: "/many",
    getUserLikedSong: "/me/liked-songs"
};
