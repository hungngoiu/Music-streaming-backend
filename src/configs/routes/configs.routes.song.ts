import { defaultRoutesConfigProps } from "./config.routes.default.js";

interface songRouteConfigProps extends defaultRoutesConfigProps {
    getSong: string;
    getSongs: string;
    streamSong: string;
}

export const songRouteConfig: songRouteConfigProps = {
    index: "/songs",
    status: "/status",
    getSong: "/:id",
    getSongs: "/many",
    streamSong: "/stream/:id"
};
