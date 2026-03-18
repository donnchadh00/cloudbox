const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const { getScopedFileKey } = require('./logic');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Allow-Methods': '*'
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { 
      statusCode: 200, 
      headers: corsHeaders, 
      body: '' };
  }

  const bucketName = process.env.CLOUDBOX_STORAGE_BUCKET?.trim();
  const keyResult = getScopedFileKey({
    userId: event.requestContext?.authorizer?.claims?.sub,
    encodedFileName: event.pathParameters?.fileName || '',
  });

  if (!bucketName) {
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Storage bucket environment variable is not configured' }),
    };
  }

  if (keyResult.statusCode) {
    return {
      statusCode: keyResult.statusCode,
      headers: corsHeaders,
      body: JSON.stringify(keyResult.body),
    };
  }

  try {
    const url = s3.getSignedUrl('getObject', {
      Bucket: bucketName,
      Key: keyResult.key,
      Expires: 60
    });

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ url })
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: err.message })
    };
  }
};
