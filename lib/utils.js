'use strict';

// eslint-disable-next-line import/no-extraneous-dependencies
const AWS = require('aws-sdk');

/**
 *
 * @param {string} password the password need to be encrypted
 * @returns
 */
const encryptPassword = (password) => {
  const kmsClient = new AWS.KMS();

  return new Promise((resolve, reject) => {
    const keyId = process.env.KMS_KEY_ID;
    const text = Buffer.from(password);
    kmsClient.encrypt({ KeyId: keyId, Plaintext: text }, (err, result) => {
      if (err) {
        return reject(err);
      }

      const { CiphertextBlob } = result;

      return resolve(CiphertextBlob.toString('base64'));
    });
  });
};

module.exports = { encryptPassword };
