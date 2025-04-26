import { CustomError } from "@/errors/CustomError.js";
import {
    addSongSchema,
    addSongsSchema,
    setSongsSchema,
    uploadAlbumSchema
} from "@/schemas/index.js";
import { uploadSongSchema } from "@/schemas/song.schema.js";
import { albumService, songService } from "@/services/index.js";
import { omitPropsFromObject } from "@/utils/object.js";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { z } from "zod";

export const userController = {
    uploadSong: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const bodyData = req.body as z.infer<typeof uploadSongSchema>;
            const user = req.user!;
            const files = req.files as {
                [fieldname: string]: Express.Multer.File[];
            };
            if (!files.audioFile) {
                throw new CustomError(
                    "Must upload a song",
                    StatusCodes.BAD_REQUEST
                );
            }
            if (!files.coverImage) {
                throw new CustomError(
                    "Must upload a cover image",
                    StatusCodes.BAD_REQUEST
                );
            }
            const audioFile = files.audioFile[0];
            const coverImage = files.coverImage[0];
            const { song, coverImageUrl } = await songService.createSong(
                bodyData,
                user.id,
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
    },

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
            const { album, coverImageUrl } = await albumService.createAlbum(
                bodyData,
                user.id,
                file
            );
            res.status(StatusCodes.CREATED).json({
                status: "success",
                message: "Album created successfully",
                data: {
                    album: {
                        ...omitPropsFromObject(album, ["coverImagePath"]),
                        coverImageUrl
                    }
                }
            });
        } catch (err) {
            next(err);
        }
    },

    setSongs: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const albumId = req.params.id;
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
    }
};
