import { getAlbumQuerySchema } from "@/schemas/index.js";
import { albumService } from "@/services/index.js";
import { omitPropsFromObject } from "@/utils/object.js";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { z } from "zod";

export const albumController = {
    getAlbum: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const albumId = req.params.id;
            const queries = req.query as z.infer<typeof getAlbumQuerySchema>;
            const { userProfile, songs } = queries;
            const { album, coverImageUrl } = await albumService.getAlbum({
                id: albumId,
                options: {
                    userProfile,
                    songs
                }
            });
            res.status(StatusCodes.OK).json({
                status: "success",
                data: {
                    album: {
                        ...omitPropsFromObject(album, [
                            "coverImagePath",
                            "songsWithImageUrl"
                        ]),
                        songs: album.songsWithImageUrl?.map((songAndUrl) => {
                            const { song, coverImageUrl } = songAndUrl;
                            return {
                                ...omitPropsFromObject(song, [
                                    "audioFilePath",
                                    "coverImagePath",
                                    "albumOrder"
                                ]),
                                coverImageUrl
                            };
                        }),
                        coverImageUrl
                    }
                }
            });
        } catch (err) {
            next(err);
        }
    }
};
