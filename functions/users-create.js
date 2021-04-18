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
  if (!data || !data.email || !data.username || !data.credentials) {
    return callback(null, {
      statusCode: 400,
      headers: { 'Content-Type': 'text/plain' },
      body: 'Invalid request',
    });
  }

  const userItem = {
    id: uuid.v1(),
    username: data.username,
    firstName: data.firstName,
    lastName: data.firstName,
    email: data.email,
    credentials: data.credentials,
  };

  const transactItems = [
    {
      Put: {
        TableName: process.env.USERS_TABLE,
        // check not exists before (no user with this ID)
        ConditionExpression: 'attribute_not_exists(#pk)',
        ExpressionAttributeNames: {
          '#pk': 'id',
        },
        // the attributes
        Item: userItem,
      },
    },
    {
      Put: {
        TableName: process.env.UNIQUES_TABLE,
        // check not exists before (no user with this email)
        ConditionExpression: 'attribute_not_exists(#pk)',
        ExpressionAttributeNames: {
          '#pk': 'value',
        },
        // the item attributes
        Item: {
          value: `UNIQUE#EMAIL:${data.email}`,
        },
      },
    },
    {
      Put: {
        TableName: process.env.UNIQUES_TABLE,
        // check not exists before (no user with this email)
        ConditionExpression: 'attribute_not_exists(#pk)',
        ExpressionAttributeNames: {
          '#pk': 'value',
        },
        // the item attributes
        Item: {
          value: `UNIQUE#USERNAME:${data.username}`,
        },
      },
    },
  ];

  return dynamoDb.transactWrite({ TransactItems: transactItems }, (err) => {
    if (err) {
      return callback(null, {
        statusCode: err.statusCode || 501,
        headers: { 'Content-Type': 'text/plain' },
        body: `Could not create new user: ${err.message}`,
      });
    }

    return callback(null, {
      statusCode: 200,
      body: JSON.stringify(userItem),
    });
  });
};
