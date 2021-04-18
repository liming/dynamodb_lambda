# dynamodb_lambda

This task is not fully completed because of the limitation of time. I'm pretty new to serverless application. Selecting this DynamoDB + Lambda is to learn DynamoDB and KMS.

## Walk through

1. [DONE] Created a serverless framework application.
2. [DONE] + [TODO] Created a DynamoDB table. But still struggle to find the best practise of validating the body. It's a better idea to have JSON schema validation on API Gateway level so it doesn't need to invoke lambda if the body is not valid. But don't have enough time to do this.
3. [DONE] Created 2 Lambda functions (users-create and users-list)
4. [DONE] + [QUESTION] I use *ProjectionExpression* to prevent credentials attribute from scan. Do we need to set IAM role statements condition to secure this?
5. [DONE] Encryped password using KMS with CMK. Saved key ID ARN in SSM.
6. [DONE] Lambda functions are available via API Gateway endpoint.
7. [DONE] + [FIXME] Wrote the unit test. But didn't use aws-sdk-mock, which is not under active development. One of the test case stacked at KMS.encrypt() function. Something wrong with my mock function but not sure why. (users-create.test.js mKMS.encrypt.mockImplementationOnce((_, callback) => callback(null, newUser.credentials));)
8. [TODO] + [QUESTION] Don't have time to complete JSON:API. We need to use endpoint to compose the location or links for JSON:API, but I don't know how to get endpoint in lambda. I suppose we can get such information from API gateway but don't have enough time to continue.

## Notes

- Used jest.mock and jest.fn to mock the DynamoDB and KMS API.
- When creating user, used transactWrite to create 3 items which include a user item, an email item and an username item. This is to constrain the unique values.
