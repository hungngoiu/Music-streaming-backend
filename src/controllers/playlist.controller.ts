import { createPlaylistSchema } from "@/schemas/index.js";
import { playlistService } from "@/services/index.js";
import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { z } from "zod";

export const playlistController = {
    createPlaylist: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const bodyData = req.body as z.infer<typeof createPlaylistSchema>;
            const user = req.user!;
            const file = req.file;
            const album = await playlistService.createPlaylist(
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
    }
};
