import { userRouteConfig } from "@/configs/routes/index.js";
import { Router } from "express";
import { StatusCodes } from "http-status-codes";
import { Request, Response } from "express";
import { userController } from "@/controllers/user.controller.js";
import { verifyTokenMiddleware } from "@/middlewares/token.middleware.js";
import { singleFileUpload } from "@/middlewares/file.middleware.js";
import { audioBucketConfigs } from "@/configs/storage.config.js";
const router = Router();

router.get(userRouteConfig.status, (req: Request, res: Response) => {
    res.status(StatusCodes.OK).json({
        message: "Auth api",
        status: "OK"
    });
});

router.post(
    userRouteConfig.upload,
    verifyTokenMiddleware("at"),
    singleFileUpload({
        fieldName: "song",
        allowedExtensions: audioBucketConfigs.allowedExtension
    }),
    userController.upload
);

export default router;
