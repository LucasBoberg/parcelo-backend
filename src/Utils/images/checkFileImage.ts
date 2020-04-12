import * as path from "path";
import { File } from "fastify-multer/lib/interfaces";

export function checkFileImage(file: File, cb) {
    const fileTypes = /jpeg|jpg|png|gif/;

    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());

    const mimetype = fileTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error("Images Only"));
    }
}