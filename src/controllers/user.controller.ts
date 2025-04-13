import { CustomError } from "@/errors/CustomError.js";
import { uploadSongSchema } from "@/schemas/song.schema.js";
import { songService } from "@/services/index.js";
import { omitPropsFromObject } from "@/utils/object.js";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { z } from "zod";

export const userController = {
    upload: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const bodyData = req.body as z.infer<typeof uploadSongSchema>;
            const user = req.user;
            const files = req.files as
                | { [fieldname: string]: Express.Multer.File[] }
                | undefined;
            if (!files) {
                throw new CustomError(
                    "No files uploaded",
                    StatusCodes.BAD_REQUEST
                );
            }
            const audioFile = files.audioFile[0];
            const coverImage = files.coverImage[0];
            const { song, coverImageUrl } = await songService.createSong(
                bodyData,
                user!.id,
                audioFile,
                coverImage
            );
            res.status(StatusCodes.CREATED).json({
                status: "success",
                message: "Song uploaded successfully",
                data: {
                    song: {
                        ...omitPropsFromObject(song, [
                            "audioFilePath",
                            "coverImagePath"
                        ]),
                        coverImageUrl
                    }
                }
            });
        } catch (err) {
            next(err);
        }
    }
};
