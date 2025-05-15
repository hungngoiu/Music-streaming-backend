import { albumRouteConfig } from "@/configs/routes/index.js";
import { albumController } from "@/controllers/album.controller.js";
import {
    isVerifiedUserMiddleware,
    singleFileUpload,
    verifyTokenMiddleware
} from "@/middlewares/index.js";
import {
    getAlbumQuerySchema,
    getAlbumsQuerySchema
} from "@/schemas/album.schema.js";
import { dataValidation } from "@/validations/data.validations.js";
import { Router, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

const router = Router();

router.get(albumRouteConfig.status, (req: Request, res: Response) => {
    res.status(StatusCodes.OK).json({
        message: "Album api",
        status: "OK"
    });
});

router.post(
    albumRouteConfig.createAlbum,
    verifyTokenMiddleware({ type: "at" }),
    isVerifiedUserMiddleware,
    singleFileUpload({
        fieldName: "coverImage",
        allowedExtensions: [".jpg", "jpeg", ".png"]
    }),
    albumController.createAlbum
);

router.patch(
    albumRouteConfig.addSong,
    verifyTokenMiddleware({ type: "at" }),
    isVerifiedUserMiddleware,
    albumController.addSong
);

router.patch(
    albumRouteConfig.addSongs,
    verifyTokenMiddleware({ type: "at" }),
    isVerifiedUserMiddleware,
    albumController.addSongs
);

router.put(
    albumRouteConfig.setSongs,
    verifyTokenMiddleware({ type: "at" }),
    isVerifiedUserMiddleware,
    albumController.setSongs
);

router.patch(
    albumRouteConfig.publicAlbum,
    verifyTokenMiddleware({ type: "at" }),
    isVerifiedUserMiddleware,
    albumController.publicAlbum
);

router.get(
    albumRouteConfig.getAlbums,
    verifyTokenMiddleware({ type: "at", required: false }),
    dataValidation(getAlbumsQuerySchema, "query"),
    albumController.getAlbums
);

router.get(
    albumRouteConfig.getAlbum,
    verifyTokenMiddleware({ type: "at", required: false }),
    dataValidation(getAlbumQuerySchema, "query"),
    albumController.getAlbum
);

export default router;
