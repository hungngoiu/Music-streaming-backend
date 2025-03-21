import { CustomError } from "@/errors/CustomError.js";
import { getSongSchema } from "@/schemas/song.schema.js";
import { songService } from "@/services/song.service.js";
import { omitPropsFromObject } from "@/utils/object.js";
import axios from "axios";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { z } from "zod";

export const songController = {
    getSong: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const songId = req.params.id;
            const { song, coverImageUrl } = await songService.getSong(songId);
            res.status(StatusCodes.OK).json({
                status: "success",
                data: {
                    song: omitPropsFromObject(song, [
                        "audioFilePath",
                        "coverImagePath"
                    ]),
                    coverImageUrl
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
            const songsAndUrls = await songService.getSongs({
                ...omitPropsFromObject(queries, ["limit", "offset"]),
                options: {
                    limit,
                    offset
                }
            });
            res.status(StatusCodes.OK).json({
                status: "success",
                data: songsAndUrls.map((songAndUrl) => {
                    const { song, coverImageUrl } = songAndUrl;
                    return {
                        song: omitPropsFromObject(song, [
                            "audioFilePath",
                            "coverImagePath"
                        ]),
                        coverImageUrl
                    };
                })
            });
        } catch (err) {
            next(err);
        }
    },

    streamSong: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const songId = req.params.id;
            const audioUrl = await songService.getSongSignedAudioUrl(songId);
            const chunk_size = 500 * 1e3; //0.5MB chunk size
            const range = req.headers.range || "0";

            if (!audioUrl) {
                throw new CustomError(
                    "Unable fetching song",
                    StatusCodes.INTERNAL_SERVER_ERROR
                );
            }

            const audioResponse = await axios.head(audioUrl);
            const audioSize = parseInt(
                audioResponse.headers["content-length"],
                10
            );
            const start = Number(range.replace(/\D/g, ""));
            const end = Math.min(start + chunk_size - 1, audioSize - 1);
            const contentLength = end - start + 1;

            const audioStream = await axios({
                url: audioUrl,
                method: "GET",
                responseType: "stream",
                headers: {
                    Range: `bytes=${start}-${end}`
                }
            });
            const headers = {
                "Content-Range": `bytes ${start}-${end}/${audioSize}`,
                "Accept-Ranges": "bytes",
                "Content-Length": contentLength,
                "Content-Type": "audio/mpeg",
                "Transfer-Encoding": "chunked"
            };
            res.status(StatusCodes.PARTIAL_CONTENT).set(headers);
            audioStream.data.pipe(res);
        } catch (err) {
            next(err);
        }
    }
};
