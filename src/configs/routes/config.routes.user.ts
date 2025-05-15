import { defaultRoutesConfigProps } from "./config.routes.default.js";

interface userRouteConfigProps extends defaultRoutesConfigProps {
    updateAvatar: string;
    updateProfile: string;
    getUser: string;
    getUsers: string;
}

export const userRouteConfig: userRouteConfigProps = {
    index: "/users",
    status: "/status",
    updateAvatar: "/profiles/avatar",
    updateProfile: "/profiles",
    getUser: "/:id",
    getUsers: "/many"
};
