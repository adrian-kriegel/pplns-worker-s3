
import PipelineApi from '@pplns/node-sdk';

import {
  DataItemWrite,
  NodeRead,
} from '@pplns/schemas';

import { S3 } from 'aws-sdk';
import { writeFileSync } from 'fs';

import NodeS3 from '../src/nodeS3';

const dataItems : DataItemWrite[] = [];

/** */
class MockPipes extends PipelineApi
{
  /** */
  constructor()
  {
    super({});

    (this as any).client = {
      get: () => Promise.resolve<{ data: Pick<NodeRead, 'params'> }>(
        {
          data:
          {
            params: 
            {
              bucket: 'source-bucket',
            },
          },
        },
      ),
      post: (_ : string, item : DataItemWrite) => dataItems.push(item),
    };
  }
}

describe('S3 Worker', () => 
{
  const node = new NodeS3(
    'node-id',
    new MockPipes(),
  );

  test(
    'Emits all objects in the bucket.',
    async () => 
    {
      const expectedFiles = [...Array(5)].map((_, i) => `file_${i}`);

      const s3 = new S3();

      await s3.createBucket({ Bucket: 'source-bucket' }).promise();

      expectedFiles.forEach(
        (f) => writeFileSync('./tmp/buckets/source-bucket/' + f, ':-)'),
      );

      await node.load();

      await node.run();

      expect(dataItems.length).toBe(expectedFiles.length);

      for (const item of dataItems)
      {
        expect(item.outputChannel)
          .toBe('file');

        expect(item.done)
          .toBe(true);

        expect(item.data.length)
          .toBe(1);
      }

      expect(
        dataItems.map(({ data }) => data[0].s3Url).sort(),
      ).toStrictEqual(
        expectedFiles.map((f) => node.getUrl(f)),
      );

      expect(
        dataItems.map(({ flowId }) => flowId).sort(),
      ).toStrictEqual(
        expectedFiles,
      );
    },
  );
  test.todo('Emits any newly created objects.');
});
