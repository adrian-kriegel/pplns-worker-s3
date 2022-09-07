
/**
 * Run to export worker definition for the core-api to consume.
 */

import { writeFileSync } from 'fs';
import path from 'path';
import WorkerS3 from '../src/worker-s3';

writeFileSync(
  path.join(__dirname, '../pplns/worker.json'),
  JSON.stringify(
    new WorkerS3(),
    null,
    2,
  ),
);
