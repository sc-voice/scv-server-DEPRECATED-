import path from 'path';
import {fileURLToPath} from 'url';
const __filename = fileURLToPath(import.meta.url);
import { logger, } from 'log-instance';
import S3Creds from '../src/s3-creds.cjs';

// ensure argv is actually for script instead of mocha
let { argv } = process;

let s3Creds = new S3Creds();

console.log(`${__filename} argv`, s3Creds);
