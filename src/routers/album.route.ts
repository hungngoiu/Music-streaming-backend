import { albumRouteConfig } from "@/configs/routes/index.js";
import { albumController } from "@/controllers/album.controller.js";
import { verifyTokenMiddleware } from "@/middlewares/auth.middleware.js";
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
