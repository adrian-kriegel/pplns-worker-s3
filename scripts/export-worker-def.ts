
/**
 * Run to export worker definition for the core-api to consume.
 */

import { writeFileSync } from 'fs';
import path from 'path';
import WorkerS3 from '../src/worker-s3';

const worker = new WorkerS3();

writeFileSync(
  path.join(__dirname, `../pplns_workers/${worker._id}.json`),
  JSON.stringify(
    worker,
    null,
    2,
  ),
);
