import { defaultRoutesConfigProps } from "./config.routes.default.js";

interface albumRouteConfigProps extends defaultRoutesConfigProps {
    getAlbum: string;
    getAlbums: string;
}

export const albumRouteConfig: albumRouteConfigProps = {
    index: "/albums",
    status: "/status",
    getAlbum: "/:id",
    getAlbums: "/many"
};
