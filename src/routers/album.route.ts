import { albumRouteConfig } from "@/configs/routes/index.js";
import { albumController } from "@/controllers/album.controller.js";
import { getAlbumQuerySchema } from "@/schemas/album.schema.js";
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
    albumRouteConfig.getAlbum,
    dataValidation(getAlbumQuerySchema, "query"),
    albumController.getAlbum
);

export default router;
