'use strict';

// eslint-disable-next-line import/no-extraneous-dependencies
const AWS = require('aws-sdk');

const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.handler = (event, context, callback) => {
  listUser({}, callback);
};

const listUser = (options, callback) => {
  const params = {
    TableName: process.env.USERS_TABLE,
    // do not read credentials
    ProjectionExpression: 'id, username, email, firstName, lastName',
  };

  dynamoDb.scan(params, (err, result) => {
    if (err) {
      return callback(null, {
        statusCode: err.statusCode || 501,
        headers: { 'Content-Type': 'text/plain' },
        body: `Couldn't fetch the users: ${err.message}`,
      });
    }

    return callback(null, {
      statusCode: 200,
      body: JSON.stringify(result.Items),
    });
  });
};
