import supabaseClient from "@/databases/storage.js";
import logger from "@/utils/logger.js";
import { randomUUID } from "crypto";
import { fileTypeFromBuffer } from "file-type";
import { CustomError } from "@/errors/CustomError.js";
import { StatusCodes } from "http-status-codes";
export const storageService = {
    uploadOne: async (bucket: string, folder: string, buffer: Buffer) => {
        const fileType = await fileTypeFromBuffer(buffer);
        if (!fileType) {
            throw new CustomError(
                "Cannot detect file type",
                StatusCodes.INTERNAL_SERVER_ERROR
            );
        }
        const { ext, mime } = fileType;
        const fileName = `${randomUUID()}.${ext}`;
        const filePath = `${folder}/${fileName}`;

        const { error } = await supabaseClient.storage
            .from(bucket)
            .upload(filePath, buffer, { contentType: mime });
        return { error, filePath };
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
