
require('dotenv').config();

import PipelineApi from '@pplns/node-sdk';

import S3Worker from './workers3';
import NodeS3 from './nodeS3';

const pipes = new PipelineApi(
  {
    baseURL: process.env.PPLN_API,
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

  return node.run();
}

run();
