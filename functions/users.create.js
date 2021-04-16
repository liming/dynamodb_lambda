'use strict';

const uuid = require('uuid');
const AWS = require('aws-sdk');

const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.handler = (event, context, callback) => {
  const timestamp = new Date().getTime();
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
    TableName: process.env.DYNAMODB_TABLE,
    Item: {
      id: uuid.v1(),
      firstName: data.firstName,
      lastName: data.firstName,
      email: data.email,
      credentials: data.credentials,
    },
  };

  dynamoDb.put(params, (err) => {
    if (err) {
      console.error(err);

      return callback(null, {
        statusCode: err.statusCode || 501,
        headers: { 'Content-Type': 'text/plain' },
        body: 'Could not create new user: ' + err.message,
      });
    }

    callback(null, {
      statusCode: 200,
      body: JSON.stringify(params.Item),
    });
  });
};
