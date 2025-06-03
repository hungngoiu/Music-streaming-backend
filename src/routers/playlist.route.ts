import { playlistRouteConfig } from "@/configs/routes/index.js";
import { Router } from "express";
import { StatusCodes } from "http-status-codes";
import { Request, Response } from "express";
import {
    isVerifiedUserMiddleware,
    singleFileUpload,
    verifyTokenMiddleware
} from "@/middlewares/index.js";
import { createPlaylistSchema } from "@/schemas/index.js";
import { dataValidation } from "@/validations/data.validations.js";
import { playlistController } from "@/controllers/index.js";
const router = Router();

router.get(playlistRouteConfig.status, (req: Request, res: Response) => {
    res.status(StatusCodes.OK).json({
        message: "Playlist api",
        status: "OK"
    });
});

router.post(
    playlistRouteConfig.createPlaylist,
    verifyTokenMiddleware({ type: "at" }),
    isVerifiedUserMiddleware,
    singleFileUpload({
        fieldName: "coverImage",
        allowedExtensions: [".jpg", "jpeg", ".png"]
    }),
    dataValidation(createPlaylistSchema, "body"),
    playlistController.createPlaylist
);

export default router;
