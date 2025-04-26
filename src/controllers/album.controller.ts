import { getAlbumQuerySchema, getAlbumsQuerySchema } from "@/schemas/index.js";
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
            const userId = req.user?.id;
            const { userProfile, songs } = queries;
            const { album, coverImageUrl } = await albumService.getAlbum({
                id: albumId,
                options: {
                    userProfile,
                    songs
                },
                userId
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
    },

    getAlbums: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const queries = req.query as z.infer<typeof getAlbumsQuerySchema>;
            const loginUserId = req.user?.id;
            const { limit, offset, userProfiles } = queries;
            const albumsWithImageUrl = await albumService.getAlbums({
                ...omitPropsFromObject(queries, ["limit", "offset"]),
                options: {
                    limit,
                    offset,
                    userProfiles
                },
                loginUserId
            });
            res.status(StatusCodes.OK).json({
                status: "success",
                data: albumsWithImageUrl.map((albumAndUrl) => {
                    const { album, coverImageUrl } = albumAndUrl;
                    return {
                        ...omitPropsFromObject(album, ["coverImagePath"]),
                        coverImageUrl
                    };
                }),
                count: albumsWithImageUrl.length
            });
        } catch (err) {
            next(err);
        }
    }
};
