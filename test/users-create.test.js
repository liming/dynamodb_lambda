'use strict';

const aws = require('aws-sdk');
const lambdaFn = require('../functions/users-create');

// The solution is from stackoverflow:
// https://stackoverflow.com/questions/64564233/how-to-mock-aws-dynamodb-in-jest-for-serverless-nodejs-lambda
// It looks like a better solution than aws-sdk-mock, which is not actively maintained
jest.mock('aws-sdk', () => {
  // DynamoDB mock
  const mDocumentClient = { transactWrite: jest.fn() };
  const mDynamoDB = { DocumentClient: jest.fn(() => mDocumentClient) };

  // KMS mock
  const mKMS = jest.fn(() => ({ encrypt: jest.fn() }));

  return { DynamoDB: mDynamoDB, KMS: mKMS };
});

const mDynamoDb = new aws.DynamoDB.DocumentClient();
const mKMS = new aws.KMS();

describe('Create user', () => {
  const newUser = {
    firstName: 'Benjamin',
    lastName: 'Button',
    username: 'bb2013',
    credentials: 'badpassword',
    email: 'notarealbenjaminbutton@gmail.com',
  };

  afterAll(() => {
    jest.resetAllMocks();
  });

  it('It should create a new user', (done) => {
    const evt = {
      body: JSON.stringify(newUser),
    };

    mDynamoDb.transactWrite.mockImplementationOnce((_, callback) => callback(null, newUser));
    mKMS.encrypt.mockImplementationOnce((_, callback) => callback(null, newUser.credentials));

    lambdaFn.handler(evt, jest.fn(), (err, result) => {
      expect(err).toBeNull();
      expect(result).toBeTruthy();
      expect(result.statusCode).toEqual(200);
      expect(result.body).toBeTruthy();

      const user = JSON.parse(result.body);

      expect(user).toHaveProperty('id');
      expect(user.firstName).toEqual(newUser.firstName);

      done();
    });
  });
});
