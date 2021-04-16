'use strict';

// eslint-disable-next-line import/no-extraneous-dependencies
const AWS = require('aws-sdk');

const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.handler = (event, context, callback) => {
  listUser({}, callback);
};

const listUser = (options, callback) => {
  const params = {
    TableName: process.env.DYNAMODB_TABLE,
  };

  dynamoDb.scan(params, (error, result) => {
    if (error) {
      return callback(null, {
        statusCode: error.statusCode || 501,
        headers: { 'Content-Type': 'text/plain' },
        body: "Couldn't fetch the users.",
      });
    }

    return callback(null, {
      statusCode: 200,
      body: JSON.stringify(result.Items),
    });
  });
};
