
import type {
  WorkerWrite,
} from '@pplns/schemas';

import { Type } from '@sinclair/typebox';

/** Worker definition for the S3 worker. */
export default class WorkerS3
implements WorkerWrite
{
  key = 'aws_s3_emit';

  title = 'AWS S3';

  description = 'Emit files from AWS S3 as outputs.';

  inputs = {};

  outputs =
  {
    file: Type.Object(
      {
        // s3 URL to the file
        s3Url: Type.String(),
      },
    ),
  };

  params = 
  {
    bucket: Type.String(),
  }
}
