import express, { Express } from "express";
import { envConfig } from "@/configs/index.js";
import { rootRouter } from "@/routers/index.js";
import logger from "@/utils/logger.js";
import { errorMiddleware } from "./middlewares/index.js";
import { connectDbs, disconnectDbs } from "./databases/index.js";
import { Server } from "http";
import { apiConfig } from "./configs/routes/index.js";
import cookieParser from "cookie-parser";
const app: Express = express();

const startServer = async () => {
    await connectDbs();

    app.use(express.json());
    app.use(cookieParser());
    app.use(apiConfig.api, rootRouter);
    app.use(errorMiddleware);

    const server: Server = app.listen(envConfig.PORT, () => {
        logger.info(`Server running on port ${envConfig.PORT}`);
        logger.info(
            `Access APIs through: http://localhost:${envConfig.PORT}${apiConfig.api}`
        );
        logger.info(
            `Access docs through: http://localhost:${envConfig.PORT}${apiConfig.docs}`
        );
    });

    process.on("SIGINT", () => shutdownServer(server, "SIGINT"));
    process.on("SIGTERM", () => shutdownServer(server, "SIGTERM"));
};

const shutdownServer = async (server: Server, signal: string) => {
    try {
        logger.warn(`Received ${signal}. Closing server...`);
        await server.close();
        await disconnectDbs();
        logger.info("Server and databases disconnected successfully.");
        process.exit(0);
    } catch (error) {
        logger.error(`Error while shutting down: ${error}`);
        process.exit(1);
    }
};

startServer();
