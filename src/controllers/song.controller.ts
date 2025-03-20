import { CustomError } from "@/errors/CustomError.js";
import { getSongSchema } from "@/schemas/song.schema.js";
import { songService } from "@/services/song.service.js";
import { omitPropsFromObject } from "@/utils/object.js";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { z } from "zod";

export const songController = {
    getSong: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const songId = req.params.id;
            const song = await songService.getSong({ id: songId });
            if (!song) {
                throw new CustomError("Song not found", StatusCodes.NOT_FOUND);
            }
            res.status(StatusCodes.OK).json({
                status: "success",
                data: {
                    song: omitPropsFromObject(song, [
                        "audioFilePath",
                        "coverImagePath"
                    ])
                }
            });
        } catch (err) {
            next(err);
        }
    },

    getSongs: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const queries = req.query as z.infer<typeof getSongSchema>;
            const { limit, offset } = queries;
            const songs = await songService.getSongs({
                ...omitPropsFromObject(queries, ["limit", "offset"]),
                options: {
                    limit,
                    offset
                }
            });
            res.status(StatusCodes.OK).json({
                status: "success",
                data: {
                    songs: songs.map((song) =>
                        omitPropsFromObject(song, [
                            "audioFilePath",
                            "coverImagePath"
                        ])
                    ),
                    count: songs.length
                }
            });
        } catch (err) {
            next(err);
        }
    }
};
