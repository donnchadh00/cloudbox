const AWS = require('aws-sdk');
const s3 = new AWS.S3();

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
  const userId = event.requestContext?.authorizer?.claims?.sub;
  const key = decodeURIComponent(event.pathParameters?.fileName || '');
  const userPrefix = `${userId}/`;

  if (!bucketName) {
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Storage bucket environment variable is not configured' }),
    };
  }

  if (!userId) {
    return {
      statusCode: 401,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Unauthorized: user ID missing' }),
    };
  }

  if (!key) {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Missing file name' })
    };
  }

  if (!key.startsWith(userPrefix)) {
    return {
      statusCode: 403,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Forbidden: file key is outside user scope' }),
    };
  }

  try {
    const url = s3.getSignedUrl('getObject', {
      Bucket: bucketName,
      Key: key,
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
