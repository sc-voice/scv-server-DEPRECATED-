import path from 'path';
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);

import { logger, } from 'log-instance';
import {
    ScvServer,
} from '../index.mjs';

// ensure argv is actually for script instead of mocha
var argv = process.argv[1].match(__filename) && process.argv || [];
argv.filter(a => a==='--log-debug').length && (logger.level = 'debug');
var port = argv.reduce((a,v)=>(v==='-3000' ? 3000 : a), undefined);
var apiUrl = argv.some((a) => a === '--staging')
    ? 'http://staging.suttacentral.net/api'
    : 'http://suttacentral.net/api';

logger.info("sc-voice: starting");
let protocol = argv.some((a) => a === '--ssl') ? "https" : "http";
let opts = { apiUrl, protocol };
port != null && (opts.port = port);
let scv = new ScvServer(opts);
await scv.initialize();
logger.info("sc-voice: server is running");
