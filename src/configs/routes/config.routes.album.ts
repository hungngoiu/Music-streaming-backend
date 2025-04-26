import { defaultRoutesConfigProps } from "./config.routes.default.js";

interface albumRouteConfigProps extends defaultRoutesConfigProps {
    getAlbum: string;
}

export const albumRouteConfig: albumRouteConfigProps = {
    index: "/albums",
    status: "/status",
    getAlbum: "/:id"
};
