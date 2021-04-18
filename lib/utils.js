'use strict';

// eslint-disable-next-line import/no-extraneous-dependencies
const AWS = require('aws-sdk');

/**
 * 
 * @param {string} password the password need to be encrypted
 * @returns 
 */
const encryptPassword = async (password) => {
  const kmsClient = new AWS.KMS();

  const keyId = process.env.KMS_KEY_ID;
  const text = Buffer.from(password);
  const { CiphertextBlob } = await kmsClient.encrypt({ KeyId: keyId, Plaintext: text }).promise();

  return CiphertextBlob.toString('base64');
};

module.exports = { encryptPassword };
