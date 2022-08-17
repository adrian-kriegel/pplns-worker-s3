
import type { S3CreateEvent } from 'aws-lambda';

import { S3 } from 'aws-sdk';

import type WorkerS3 from './workers3';

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
    return this.param('bucket') + '/' + key;
  }

  /**
   * @param s3obj bucket item
   * @returns s3 key
   */
  getKey(s3obj : any)
  {
    return s3obj.prefix + s3obj.name;
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
    return listAllObjects(
      s3, 
      { Bucket: this.param('bucket') },
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
