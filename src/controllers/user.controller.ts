import { CustomError } from "@/errors/CustomError.js";
import { uploadSongSchema } from "@/schemas/song.schema.js";
import { songService } from "@/services/song.service.js";
import { omitPropsFromObject } from "@/utils/object.js";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { z } from "zod";

export const userController = {
    upload: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const bodyData = req.body as z.infer<typeof uploadSongSchema>;
            const { file, user } = req;
            if (!file) {
                throw new CustomError(
                    "Must upload a file under field song",
                    StatusCodes.BAD_REQUEST
                );
            }
            const { song, url } = await songService.createSong(
                bodyData,
                user!.id,
                file!
            );
            const message = url
                ? "Song uploaded successfully"
                : "Song uploaded successfully, but failed to generate an url";
            res.status(StatusCodes.OK).json({
                status: "success",
                message: message,
                data: {
                    song: omitPropsFromObject(song, "path"),
                    url: url
                }
            });
        } catch (err) {
            next(err);
        }
    }
};
