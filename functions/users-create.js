'use strict';

// eslint-disable-next-line import/no-extraneous-dependencies
const AWS = require('aws-sdk');
const uuid = require('uuid');

const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.handler = (event, context, callback) => {
  const data = JSON.parse(event.body);

  createUser(data, callback);
};

const createUser = (data, callback) => {
  // validate input data
  // ideally this should be done in API gateway so lambdas does not have to be invoked
  if (!data || !data.email || !data.credentials) {
    return callback(null, {
      statusCode: 400,
      headers: { 'Content-Type': 'text/plain' },
      body: 'Invalid request',
    });
  }

  const params = {
    TableName: process.env.USERS_TABLE,
    Item: {
      id: uuid.v1(),
      firstName: data.firstName,
      lastName: data.firstName,
      email: data.email,
      credentials: data.credentials,
    },
  };

  return dynamoDb.put(params, (err) => {
    if (err) {
      return callback(null, {
        statusCode: err.statusCode || 501,
        headers: { 'Content-Type': 'text/plain' },
        body: `Could not create new user: ${err.message}`,
      });
    }

    return callback(null, {
      statusCode: 200,
      body: JSON.stringify(params.Item),
    });
  });
};
