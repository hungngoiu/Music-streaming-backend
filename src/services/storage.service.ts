import supabaseClient from "@/databases/storage.js";
import { CustomError } from "@/errors/CustomError.js";
import { randomUUID } from "crypto";
import { StatusCodes } from "http-status-codes";

export const uploadFile = async (
    bucket: string,
    folder: string,
    file: Express.Multer.File
) => {
    const fileExt = file.originalname.split(".").pop();

    const fileName = `${randomUUID()}.${fileExt}`;

    const filePath = `${folder}/${fileName}`;

    const { error } = await supabaseClient.storage
        .from(bucket)
        .upload(filePath, file.buffer);

    if (error) {
        throw new CustomError(error.message, StatusCodes.INTERNAL_SERVER_ERROR);
    }
    return { path: filePath };
};
