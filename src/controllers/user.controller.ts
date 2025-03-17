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
            const { song, audioUrl, coverImageUrl } =
                await songService.createSong(
                    bodyData,
                    user!.id,
                    audioFile,
                    coverImage
                );
            const message = audioUrl
                ? "Song uploaded successfully"
                : "Song uploaded successfully, but failed to generate an url";
            res.status(StatusCodes.OK).json({
                status: "success",
                message: message,
                data: {
                    song: omitPropsFromObject(song, [
                        "audioFilePath",
                        "coverImagePath"
                    ]),
                    audioUrl: audioUrl,
                    coverImageUrl: coverImageUrl
                }
            });
        } catch (err) {
            next(err);
        }
    }
};
