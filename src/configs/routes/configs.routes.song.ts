import { defaultRoutesConfigProps } from "./config.routes.default.js";

interface songRouteConfigProps extends defaultRoutesConfigProps {
    getSong: string;
    getSongs: string;
    streamSong: string;
    uploadSong: string;
}

export const songRouteConfig: songRouteConfigProps = {
    index: "/songs",
    status: "/status",
    uploadSong: "/",
    getSong: "/:id",
    getSongs: "/many",
    streamSong: "/stream/:id"
};
