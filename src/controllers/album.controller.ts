import { CustomError } from "@/errors/index.js";
import {
    addSongSchema,
    addSongsSchema,
    getAlbumQuerySchema,
    getAlbumsQuerySchema,
    setSongsSchema,
    uploadAlbumSchema
} from "@/schemas/index.js";
import { albumService } from "@/services/index.js";
import { omitPropsFromObject } from "@/utils/object.js";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { z } from "zod";

export const albumController = {
    createAlbum: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const bodyData = req.body as z.infer<typeof uploadAlbumSchema>;
            const user = req.user!;
            const file = req.file;
            if (!file) {
                throw new CustomError(
                    "Must upload a cover image",
                    StatusCodes.BAD_REQUEST
                );
            }
            const album = await albumService.createAlbum(
                bodyData,
                user.id,
                file
            );
            res.status(StatusCodes.CREATED).json({
                status: "success",
                message: "Album created successfully",
                data: {
                    album
                }
            });
        } catch (err) {
            next(err);
        }
    },

    setSongs: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const albumId = req.params.albumId;
            const songIds = req.body as z.infer<typeof setSongsSchema>;
            const user = req.user!;

            await albumService.setSongs(albumId, songIds, user.id);

            res.status(StatusCodes.OK).json({
                status: "success",
                message: "Set songs for album successfully"
            });
        } catch (err) {
            next(err);
        }
    },

    addSong: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const albumId = req.params.albumId;
            const songId = req.params.songId;
            const bodyData = req.body as z.infer<typeof addSongSchema>;
            const user = req.user!;

            await albumService.addSong(
                albumId,
                songId,
                user.id,
                bodyData.index
            );

            res.status(StatusCodes.OK).json({
                status: "success",
                message: "Add song to album successfully"
            });
        } catch (err) {
            next(err);
        }
    },

    addSongs: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const albumId = req.params.albumId;
            const songIds = req.body as z.infer<typeof addSongsSchema>;
            const user = req.user!;

            await albumService.addSongs(albumId, songIds, user.id);

            res.status(StatusCodes.OK).json({
                status: "success",
                message: "Add songs to album successfully"
            });
        } catch (err) {
            next(err);
        }
    },

    publicAlbum: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const albumId = req.params.id;
            const user = req.user!;

            await albumService.publicAlbum(albumId, user.id);

            res.status(StatusCodes.OK).json({
                status: "success",
                message: "Public album successfully"
            });
        } catch (err) {
            next(err);
        }
    },

    getAlbum: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const albumId = req.params.id;
            const queries = req.query as z.infer<typeof getAlbumQuerySchema>;
            const userId = req.user?.id;
            const { userProfile, songs } = queries;
            const album = await albumService.getAlbum({
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
                    album
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
            const albums = await albumService.getAlbums({
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
                data: albums,
                count: albums.length
            });
        } catch (err) {
            next(err);
        }
    }
};
