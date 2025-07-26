const AWS = require('aws-sdk');
const s3 = new AWS.S3();

exports.handler = async (event) => {
    const bucketName = 'cloudbox-storage-donnchadh00';

    try {
        console.log('Received event:', JSON.stringify(event));

        const body = JSON.parse(event.body);

        console.log('Parsed body:', body);

        switch (body.method) {
            case 'upload':
                return await uploadFile(bucketName, body.fileName, body.fileContent);
                
            case 'list':
                return await listFiles(bucketName);
                
            case 'delete':
                return await deleteFile(bucketName, body.fileNameToDelete);

            default:
                return {
                    statusCode: 400,
                    body: JSON.stringify({ error: 'Invalid method' })
                };
        }
    } catch (err) {
        console.error('Error:', err);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: err.message })
        };
    }
};

// Function to upload a file to S3
async function uploadFile(bucketName, fileName, fileContent) {
    const params = {
        Bucket: bucketName,
        Key: fileName,
        Body: Buffer.from(fileContent, 'base64'),
        ContentType: 'application/octet-stream', // Adjust the content type as needed
    };

    try {
        const result = await s3.putObject(params).promise();
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'File uploaded successfully!',
                result: result
            })
        };
    } catch (err) {
        console.error('Error uploading file:', err);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Could not upload file', details: err.message })
        };
    }
}

// Function to list files in the S3 bucket
async function listFiles(bucketName) {
    const params = {
        Bucket: bucketName
    };

    try {
        const data = await s3.listObjectsV2(params).promise();
        const fileNames = data.Contents.map(item => item.Key);
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Files listed successfully',
                files: fileNames
            })
        };
    } catch (err) {
        console.error('Error listing files:', err);
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: 'Could not list files',
                details: err.message
            })
        };
    }
}

// Function to delete a file from S3
async function deleteFile(bucketName, fileName) {
    const params = {
        Bucket: bucketName,
        Key: fileName
    };

    try {
        const data = await s3.deleteObject(params).promise();
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'File deleted successfully',
                result: data
            })
        };
    } catch (err) {
        console.error('Error deleting file:', err);
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: 'Could not delete file',
                details: err.message
            })
        };
    }
}
