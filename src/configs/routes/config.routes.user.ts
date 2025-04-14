import { defaultRoutesConfigProps } from "./config.routes.default.js";

interface userRouteConfigProps extends defaultRoutesConfigProps {
    upload: string;
}

export const userRouteConfig: userRouteConfigProps = {
    index: "/users",
    status: "/status",
    upload: "/upload"
};
