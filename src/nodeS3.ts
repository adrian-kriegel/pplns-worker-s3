
import type { S3CreateEvent } from 'aws-lambda';

import { S3 } from 'aws-sdk';

import type WorkerS3 from './worker-s3';

import { PipelineNode } from '@pplns/node-sdk';
import { listAllObjects } from './s3-util';

const s3 = new S3(
  {
    accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_S3_ACCESS_KEY as string,
  },
);

/** */
export default class NodeS3
  extends PipelineNode<WorkerS3>
{
  /**
   * TODO: Implement. This is a mock implementation. 
   * @param key bobject key
   * @returns s3 url
   */
  getUrl(key : string)
  {
    return `https://${this.param('bucket')}.s3.amazonaws.com/${key}`;
  }

  /**
   * @param key s3 object key
   * @returns Promise
   */
  emitS3Object(
    key : string,
  )
  {
    return this.emit(
      {
        done: true,
        outputChannel: 'file',
        // TODO: find out if objects can be efficiently found using their etag
        // if so, use etag as flowId instead
        flowId: key,
        data: [{ s3Url: this.getUrl(key) }],
      },
    );
  }

  /** @returns Promise<void> */
  run()
  {
    const bucket = this.param('bucket');

    return listAllObjects(
      s3, 
      { Bucket: bucket },
      (obj) => obj.Key && this.emitS3Object(obj.Key),
    );
  }

  /**
   * @param e s3 create event
   * @return Promise<void[]>
   */
  onObjectCreated(e : S3CreateEvent)
  {
    return Promise.all(
      e.Records.map(
        ({ s3 }) => this.emitS3Object(s3.object.key),
      ),
    );
  }
}
