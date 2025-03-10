import { Router } from "express";
import authRouter from "./auth.route.js";
import {
    authRouteConfig,
} from "@/configs/routes/index.js";
import { requestLogger } from "@/utils/logger.js";

export const rootRouter: Router = Router();
rootRouter.use(requestLogger);

interface configProps {
    index: string;
    router: Router;
}
const apisConfigs: configProps[] = [
    {
        index: authRouteConfig.index,
        router: authRouter
    },
];

apisConfigs.forEach((config) => {
    rootRouter.use(config.index, config.router);
});
