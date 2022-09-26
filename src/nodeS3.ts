
import type { S3CreateEvent } from 'aws-lambda';

import { S3 } from 'aws-sdk';

import type WorkerS3 from './worker-s3';

import { PipelineNode } from '@pplns/node-sdk';
import { listAllObjects } from './s3-util';
import { DataItemQuery } from '@pplns/schemas';

const s3 = new S3(
  {
    accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_S3_ACCESS_KEY as string,
    region: process.env.AWS_S3_REGION,
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
  async emitS3Object(
    key : string,
  )
  {
    const res = await this.emit(
      {
        done: true,
        outputChannel: 'file',
        flowId: key,
        data: [{ s3Url: this.getUrl(key) }],
        // s3 node is always a source node and takes no inputs
        consumptionId: null,
      },
    );

    return res;
  }

  /** @returns Promise<void> */
  async run()
  {
    const query : DataItemQuery = 
    {
      nodeId: this.nodeId,
      sort: { createdAt: -1 },
      limit: 1,
      taskId: this.get().taskId,
    };

    const resp = await this.pipes.getDataItems(
      query,
    );

    const lastEmitted = resp?.results?.[0];

    const bucket = this.param('bucket');

    return listAllObjects(
      s3, 
      { Bucket: bucket, StartAfter: lastEmitted?.flowId },
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
