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
  const body = JSON.parse(event.body || '{}');
  fileName = body.fileName;
  fileContent = body.fileContent;
  const key = `${userId}/${fileName}`;

  if (!fileName || !fileContent) {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Missing fileName or fileContent' }),
    };
  }

  try {  
    await s3.putObject({
      Bucket: bucketName,
      Key: key,
      Body: Buffer.from(fileContent, 'base64'),
      ContentType: 'application/octet-stream',
    }).promise();

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ message: 'File uploaded successfully!' }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Upload failed', details: err.message }),
    };
  }
};
