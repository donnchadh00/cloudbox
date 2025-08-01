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

  const bucketName = 'cloudbox-storage-donnchadh00';
  const userId = event.requestContext?.authorizer?.claims?.sub;
  const fileName = decodeURIComponent(event.pathParameters?.fileName || '');
  const key = `${userId}/${fileName}`;

  if (!userId) {
    return {
      statusCode: 401,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Unauthorized: user ID missing' }),
    };
  }

  if (!fileName) {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Missing file name' })
    };
  }

  try {
    const url = s3.getSignedUrl('getObject', {
      Bucket: bucketName,
      Key: fileName,
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
