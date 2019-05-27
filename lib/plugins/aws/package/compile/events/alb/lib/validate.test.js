'use strict';

const expect = require('chai').expect;
const AwsCompileAlbEvents = require('../index');
const Serverless = require('../../../../../../../Serverless');
const AwsProvider = require('../../../../../provider/awsProvider');

describe('#validate()', () => {
  let awsCompileAlbEvents;

  beforeEach(() => {
    const serverless = new Serverless();
    serverless.setProvider('aws', new AwsProvider(serverless));
    serverless.service.service = 'some-service';
    serverless.service.provider.compiledCloudFormationTemplate = { Resources: {} };

    awsCompileAlbEvents = new AwsCompileAlbEvents(serverless);
  });

  it('should detect alb event definitions', () => {
    awsCompileAlbEvents.serverless.service.functions = {
      first: {
        events: [
          {
            alb: {
              // eslint-disable-next-line max-len
              listenerArn: 'arn:aws:elasticloadbalancing:us-east-1:123456789012:listener/app/my-load-balancer/50dc6c495c0c9188/f2f7dc8efc522ab2',
              priority: 1,
              conditions: {
                host: 'example.com',
                path: '/hello',
              },
            },
          },
        ],
      },
      second: {
        events: [
          {
            alb: {
              // eslint-disable-next-line max-len
              listenerArn: 'arn:aws:elasticloadbalancing:us-east-1:123456789012:listener/app/my-load-balancer/50dc6c495c0c9188/f2f7dc8efc522ab2',
              priority: 2,
              conditions: {
                host: 'example2.com',
                path: '/world',
              },
            },
          },
        ],
      },
    };

    const validated = awsCompileAlbEvents.validate();

    expect(validated.events).to.deep.equal([
      {
        functionName: 'first',
        // eslint-disable-next-line max-len
        listenerArn: 'arn:aws:elasticloadbalancing:us-east-1:123456789012:listener/app/my-load-balancer/50dc6c495c0c9188/f2f7dc8efc522ab2',
        priority: 1,
        conditions: {
          host: 'example.com',
          path: '/hello',
        },
      },
      {
        functionName: 'second',
        // eslint-disable-next-line max-len
        listenerArn: 'arn:aws:elasticloadbalancing:us-east-1:123456789012:listener/app/my-load-balancer/50dc6c495c0c9188/f2f7dc8efc522ab2',
        priority: 2,
        conditions: {
          host: 'example2.com',
          path: '/world',
        },
      },
    ]);
  });
});