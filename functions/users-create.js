'use strict';

// eslint-disable-next-line import/no-extraneous-dependencies
const AWS = require('aws-sdk');
const uuid = require('uuid');
const { encryptPassword } = require('../lib/utils');

const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.handler = (event, context, callback) => {
  const data = JSON.parse(event.body);

  createUser(data)
    .then((result) => callback(null, result))
    .catch((err) => callback(err));
};

const createUser = async (data) => {
  // validate input data
  // ideally this should be done in API gateway so lambdas does not have to be invoked
  if (!data || !data.email || !data.username || !data.credentials) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'text/plain' },
      body: 'Invalid request',
    };
  }

  // encrypt password
  const encryptedCredentials = await encryptPassword(data.credentials);

  try {
    const userItem = {
      id: uuid.v1(),
      username: data.username,
      firstName: data.firstName,
      lastName: data.firstName,
      email: data.email,
      credentials: encryptedCredentials,
    };

    return await saveUser(userItem);
  } catch (err) {
    return {
      statusCode: err.statusCode || 501,
      headers: { 'Content-Type': 'text/plain' },
      body: `Could not create new user: ${err.message}`,
    };
  }
};

const saveUser = (userItem) => {
  return new Promise((resolve, reject) => {
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
            value: `UNIQUE#EMAIL:${userItem.email}`,
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
            value: `UNIQUE#USERNAME:${userItem.username}`,
          },
        },
      },
    ];

    return dynamoDb.transactWrite({ TransactItems: transactItems }, (err) => {
      if (err) {
        return reject(err);
      }

      return resolve({
        statusCode: 201,
        body: JSON.stringify(userItem),
      });
    });
  });
};
