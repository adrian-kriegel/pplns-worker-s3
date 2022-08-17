
import {
  S3,
} from 'aws-sdk';

/**
 * @param s3 s3 client
 * @param params listObjectParams
 * @param callback callback for each object
 * @returns Promise
 */
export async function listAllObjects(
  s3 : S3,
  params : S3.ListObjectsV2Request,
  callback : (obj : S3.Object) => any,
)
{
  let isTruncated = true;

  const listObjectParams =
  {
    ...params,
    // this is required for mock-s3 to return a continuation token...
    Delimiter: '/',
  };

  do
  {
    const data = await s3.listObjectsV2(listObjectParams).promise();

    isTruncated = !!data.IsTruncated;
    listObjectParams.ContinuationToken = data.NextContinuationToken;
    
    data.Contents && await Promise.all(
      data.Contents?.map(
        (obj) => callback(obj),
      ),
    );
  }
  while (isTruncated);
}
