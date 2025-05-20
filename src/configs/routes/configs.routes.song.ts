import { defaultRoutesConfigProps } from "./config.routes.default.js";

interface songRouteConfigProps extends defaultRoutesConfigProps {
    likeSong: string;
    unlikeSong: string;
    getSong: string;
    getSongs: string;
    streamSong: string;
    uploadSong: string;
}

export const songRouteConfig: songRouteConfigProps = {
    index: "/songs",
    status: "/status",
    uploadSong: "/",
    likeSong: "/:id/like",
    unlikeSong: "/:id/unlike",
    getSong: "/:id",
    getSongs: "/many",
    streamSong: "/stream/:id"
};
