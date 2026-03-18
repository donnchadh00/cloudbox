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

  try {
    const data = await s3.listObjectsV2({
      Bucket: bucketName,
      Prefix: `${userId}/`
    }).promise();

    const fileList = data.Contents.map(item => ({
      key: item.Key,
      size: item.Size,
      lastModified: item.LastModified
    }));

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ files: fileList })
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: err.message })
    };
  }
};
