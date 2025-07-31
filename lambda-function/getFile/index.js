const AWS = require('aws-sdk');
const s3 = new AWS.S3();

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Allow-Methods': '*'
};

exports.handler = async (event) => {

  const bucketName = 'cloudbox-storage-donnchadh00';
  const fileName = decodeURIComponent(event.pathParameters?.fileName || '');

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
      Expires: 60 // 1 minute URL
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
