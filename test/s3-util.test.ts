
import { S3 } from 'aws-sdk';
import { writeFileSync } from 'fs';

import { listAllObjects } from '../src/s3-util';

describe('listAllObjects', () => 
{
  it('Runs callback once for each file.', async () => 
  {
    const files : S3.Object[] = [];

    const s3 = new S3();

    const expectedFiles = [...Array(5)].map((_, i) => `file_${i}`);

    await s3.createBucket({ Bucket: 'my-bucket' }).promise();

    expectedFiles.forEach(
      (f) => writeFileSync('./tmp/buckets/my-bucket/' + f, ':-)'),
    );

    await listAllObjects(
      s3,
      { Bucket: 'my-bucket', MaxKeys: 2 },
      (o) => files.push(o),
    );

    expect(files.map((f) => f.Key).sort())
      .toStrictEqual(expectedFiles);
  });
});
