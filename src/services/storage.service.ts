import supabaseClient from "@/databases/storage.js";
import { CustomError } from "@/errors/CustomError.js";
import logger from "@/utils/logger.js";
import { randomUUID } from "crypto";
import { StatusCodes } from "http-status-codes";
import mime from "mime";

export const storageService = {
    uploadOne: async (
        bucket: string,
        folder: string,
        file: Express.Multer.File
    ) => {
        const fileExt = file.originalname.split(".").pop();
        const fileName = `${randomUUID()}.${fileExt}`;
        const filePath = `${folder}/${fileName}`;

        // Auto-detect MIME type
        const contentType =
            mime.lookup(file.originalname) || "application/octet-stream";

        const { error } = await supabaseClient.storage
            .from(bucket)
            .upload(filePath, file.buffer, { contentType });

        if (error) {
            throw new CustomError(
                error.message,
                StatusCodes.INTERNAL_SERVER_ERROR
            );
        }

        return filePath;
    },
    deleteOne: async (bucket: string, filePath: string) => {
        return await supabaseClient.storage.from(bucket).remove([filePath]);
    },
    generateUrl: async (bucket: string, filePath: string) => {
        const { data, error } = await supabaseClient.storage
            .from(bucket)
            .createSignedUrl(filePath, 900);
        if (error) {
            logger.error(error.message);
        }
        return data ? data.signedUrl : null;
    }
};
