
import type { S3CreateEvent } from 'aws-lambda';

import Minio from 'minio';

import type WorkerS3 from './workers3';

import { PipelineNode } from '@pplns/node-sdk';

const s3 = new Minio.Client(
  {
    endPoint: 's3.amazonaws.com',
    accessKey: process.env.AWS_S3_ACCESS_KEY_ID as string,
    secretKey: process.env.AWS_S3_ACCESS_KEY as string,
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
  getKey(s3obj : Minio.BucketItem)
  {
    return s3obj.prefix + s3obj.name;
  }

  /**
   * @param param0 s3 object with key and etag
   * @returns Promise
   */
  emitS3Object(
    { key } : { eTag: string, key: string },
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
    return new Promise<void>((resolve, reject) => 
    {
      const listObjects = s3.listObjectsV2(this.param('bucket'));

      listObjects.on(
        'data',
        (s3obj) => this.emitS3Object(
          {
            eTag: s3obj.etag,
            key: this.getKey(s3obj),
          },
        ),
      );

      listObjects.on('error', reject);

      listObjects.on('close', () => resolve());
    });
  }

  /**
   * @param e s3 create event
   * @return Promise<void[]>
   */
  onObjectCreated(e : S3CreateEvent)
  {
    return Promise.all(
      e.Records.map(
        (r) => this.emitS3Object(r.s3.object),
      ),
    );
  }
}
