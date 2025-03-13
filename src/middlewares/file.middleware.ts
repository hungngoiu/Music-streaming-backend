import multer, { FileFilterCallback } from "multer";
import path from "path";
import { Request } from "express";
import { CustomError } from "@/errors/index.js";
import { StatusCodes } from "http-status-codes";

type UploadOptions = {
    fieldName: string;
    allowedExtensions?: string[];
    maxSize?: number;
    maxCount?: number;
};

const fileFilter =
    (allowedExtensions: string[] = []) =>
    (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowedExtensions.includes(ext)) {
            cb(null, true);
        } else {
            cb(
                new CustomError(
                    `File type not allowed. Allowed extensions: ${allowedExtensions.join(", ")}`,
                    StatusCodes.BAD_REQUEST
                )
            );
        }
    };

const storage = multer.memoryStorage();

export const singleFileUpload = ({
    fieldName,
    allowedExtensions = [],
    maxSize = 50 * 1024 * 1024
}: UploadOptions) => {
    return multer({
        storage,
        limits: { fileSize: maxSize },
        fileFilter: fileFilter(allowedExtensions)
    }).single(fieldName);
};

export const multipleFileUpload = ({
    fieldName,
    allowedExtensions = [],
    maxSize = 50 * 1024 * 1024,
    maxCount = 10
}: UploadOptions) => {
    return multer({
        storage,
        limits: { fileSize: maxSize },
        fileFilter: fileFilter(allowedExtensions)
    }).array(fieldName, maxCount);
};
