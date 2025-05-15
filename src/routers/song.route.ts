import { songRouteConfig } from "@/configs/routes/index.js";
import { songController } from "@/controllers/song.controller.js";
import {
    isVerifiedUserMiddleware,
    verifyTokenMiddleware
} from "@/middlewares/auth.middleware.js";
import { fieldsFileUpload } from "@/middlewares/index.js";
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

router.post(
    songRouteConfig.uploadSong,
    verifyTokenMiddleware({ type: "at" }),
    isVerifiedUserMiddleware,
    fieldsFileUpload({
        fields: [
            {
                name: "audioFile",
                maxCount: 1,
                allowedExtensions: [".mp3", ".wav"]
            },
            {
                name: "coverImage",
                maxCount: 1,
                allowedExtensions: [".jpg", ".jpeg", ".png"]
            }
        ]
    }),
    isVerifiedUserMiddleware,
    songController.uploadSong
);

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
    verifyTokenMiddleware({ type: "at" }),
    isVerifiedUserMiddleware,
    songController.streamSong
);

export default router;
