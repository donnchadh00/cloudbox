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

  try {
    const data = await s3.listObjectsV2({
      Bucket: 'cloudbox-storage-donnchadh00'
    }).promise();

    const fileNames = data.Contents.map(item => item.Key);

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ files: fileNames })
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: err.message })
    };
  }
};
