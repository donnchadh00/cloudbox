const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const { getStorageBucketName } = require('../config');

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

  const bucketName = getStorageBucketName();
  const userId = event.requestContext?.authorizer?.claims?.sub;
  if (!userId) {
    return {
      statusCode: 401,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Unauthorized: user ID missing' }),
    };
  }

  const body = JSON.parse(event.body || '{}');
  const fileName = body.fileName;
  const contentType = body.contentType || 'application/octet-stream';
  const key = `${userId}/${fileName}`;

  if (!fileName) {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Missing fileName' }),
    };
  }

  try {  
    const uploadUrl = s3.getSignedUrl('putObject', {
      Bucket: bucketName,
      Key: key,
      ContentType: contentType,
      Expires: 60,
    });

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        uploadUrl,
        key,
        message: 'Upload URL created successfully!',
      }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Upload URL creation failed', details: err.message }),
    };
  }
};
