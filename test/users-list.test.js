'use strict';

const aws = require('aws-sdk');
const lambdaFn = require('../functions/users-list');

jest.mock('aws-sdk', () => {
  const mDocumentClient = { scan: jest.fn() };
  const mDynamoDB = { DocumentClient: jest.fn(() => mDocumentClient) };

  return { DynamoDB: mDynamoDB };
});

const mDynamoDb = new aws.DynamoDB.DocumentClient();

describe('List users', () => {
  afterAll(() => {
    jest.resetAllMocks();
  });

  it('List all users', (done) => {
    const fakeResults = {
      Items: [
        {
          id: '418d0050-9e64-11eb-b6cb-41652c269bb4',
          firstName: 'Benjamin',
          lastName: 'Button',
          email: 'notarealbenjaminbutton@gmail.com',
        },
        {
          id: '418d0050-9e64-11eb-b6cb-41652c269bb4',
          firstName: 'Jason',
          lastName: 'Williams',
          email: 'notarealbenjaminbutton@gmail.com',
        },
      ],
    };

    const evt = {};

    mDynamoDb.scan.mockImplementationOnce((_, callback) => callback(null, fakeResults));

    lambdaFn.handler(evt, jest.fn(), (err, result) => {
      expect(err).toBeNull();
      expect(result).toBeTruthy();
      expect(result.statusCode).toEqual(200);
      expect(result.body).toBeTruthy();

      const users = JSON.parse(result.body);

      expect(users).toHaveLength(2);

      done();
    });
  });
});
