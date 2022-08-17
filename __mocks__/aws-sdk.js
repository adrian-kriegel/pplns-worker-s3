
const { existsSync, mkdirSync } = require('fs');

const AWSMock = require('mock-aws-s3');

AWSMock.config.basePath = './tmp/buckets/';

if (!existsSync('./tmp/buckets'))
{
  mkdirSync('./tmp/buckets', { recursive: true });
}

module.exports = AWSMock;
