
require('dotenv').config();

import PipelineApi from '@pplns/node-sdk';

import S3Worker from './worker-s3';
import NodeS3 from './nodeS3';

const pipes = new PipelineApi(
  {
    baseURL: process.env.PPLNS_API,
    apiKey: process.env.PPLNS_API_KEY as string,
  },
);

const worker = new S3Worker();

/** @returns Promise<void> */
export async function run()
{
  await pipes.registerWorker(worker);

  const node = await new NodeS3(
    process.env.PPLNS_NODE_ID as string,
    pipes,
  );

  await node.load();
  
  return node.run();
}

run();
