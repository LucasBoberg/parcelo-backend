import * as fastify from "fastify";
import * as http from "http";
import * as fs from "fs";
import * as sharp from "sharp";
import * as mkdirp from "mkdirp";
import { join, extname } from 'path'
import { nanoid } from "nanoid";
import { StorageEngine, File, DiskStorageOptions, GetFileName, GetDestination } from "fastify-multer/lib/interfaces";

const getFilename: GetFileName = (req, file, cb) => {
  cb(null, nanoid());
}

const getDestination: GetDestination = (req, file, cb) => {
  cb(null, "uploads/");
}

class ProductImageStorage implements StorageEngine {

  getFilename: GetFileName
  getDestination: GetDestination
  
  constructor(opts: DiskStorageOptions) {
    this.getFilename = (opts.filename || getFilename)

    if (typeof opts.destination === 'string') {
      mkdirp.sync(opts.destination)
      this.getDestination = function($0, $1, cb) {
        cb(null, opts.destination as string)
      }
    } else {
      this.getDestination = opts.destination || getDestination
    }
  }

  _handleFile(req: fastify.FastifyRequest<http.IncomingMessage, fastify.DefaultQuery, fastify.DefaultParams, fastify.DefaultHeaders, any>, file: File, cb: (error?: Error, info?: Partial<File>) => void): void {
    this.getDestination(req, file, (err, destination) => {
      if (err) return cb(err)

      this.getFilename(req, file, (err, filename) => {
        if (err) return cb(err)

        const finalFilename = filename! + ".jpeg"
        const finalPath = join(destination, finalFilename);
        const finalPath2 = join(destination, filename.replace(extname(filename), "") + "-small.jpeg");
        const outStream = fs.createWriteStream(finalPath)
        const outStream2 = fs.createWriteStream(finalPath2);
        const resizer = sharp().jpeg({ quality: 100 });
        resizer.clone().resize(400, 200).pipe(outStream2);
    
        file.stream.pipe(resizer).pipe(outStream);
        outStream.on('error', cb)
        outStream.on('finish', function () {
          cb(null, {
            path: finalPath,
            destination: destination,
            filename: finalFilename,
            size: outStream.bytesWritten
          })
        });
      });
    });
  }
  _removeFile(req: fastify.FastifyRequest<http.IncomingMessage, fastify.DefaultQuery, fastify.DefaultParams, fastify.DefaultHeaders, any>, file: File, cb: (error?: Error) => void): void {
    fs.unlink(file.path, cb)
  }
}

export default (opts: DiskStorageOptions) => new ProductImageStorage(opts);