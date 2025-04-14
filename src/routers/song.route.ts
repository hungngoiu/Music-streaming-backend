import { songRouteConfig } from "@/configs/routes/index.js";
import { songController } from "@/controllers/song.controller.js";
import {
    isVerifiedUserMiddleware,
    verifyTokenMiddleware
} from "@/middlewares/auth.middleware.js";
import { getSongQuerySchema, getSongsSchema } from "@/schemas/song.schema.js";
import { dataValidation } from "@/validations/data.validations.js";
import { Router } from "express";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

const router = Router();

router.get(songRouteConfig.status, (req: Request, res: Response) => {
    res.status(StatusCodes.OK).json({
        message: "Song api",
        status: "OK"
    });
});

router.get(
    songRouteConfig.getSongs,
    dataValidation(getSongsSchema, "query"),
    songController.getSongs
);

router.get(
    songRouteConfig.getSong,
    dataValidation(getSongQuerySchema, "query"),
    songController.getSong
);

router.get(
    songRouteConfig.streamSong,
    verifyTokenMiddleware("at"),
    isVerifiedUserMiddleware,
    songController.streamSong
);

export default router;
