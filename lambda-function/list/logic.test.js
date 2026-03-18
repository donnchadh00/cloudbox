const test = require('node:test');
const assert = require('node:assert/strict');
const { isPreviewableImageKey, mapS3ObjectToFile } = require('./logic');

test('detects previewable image keys', () => {
  assert.equal(isPreviewableImageKey('user-123/cat.png'), true);
  assert.equal(isPreviewableImageKey('user-123/resume.pdf'), false);
});

test('adds preview urls only for previewable files', () => {
  const signedUrlCalls = [];
  const getSignedUrl = (...args) => {
    signedUrlCalls.push(args);
    return 'https://signed.example/cat.png';
  };

  const imageFile = mapS3ObjectToFile(
    {
      Key: 'user-123/cat.png',
      Size: 1024,
      LastModified: '2026-03-18T00:00:00.000Z',
    },
    {
      bucketName: 'cloudbox-storage',
      getSignedUrl,
    }
  );

  const pdfFile = mapS3ObjectToFile(
    {
      Key: 'user-123/resume.pdf',
      Size: 512,
      LastModified: '2026-03-18T00:00:00.000Z',
    },
    {
      bucketName: 'cloudbox-storage',
      getSignedUrl,
    }
  );

  assert.equal(imageFile.previewUrl, 'https://signed.example/cat.png');
  assert.equal(pdfFile.previewUrl, null);
  assert.deepEqual(signedUrlCalls, [[
    'getObject',
    {
      Bucket: 'cloudbox-storage',
      Key: 'user-123/cat.png',
      Expires: 60,
    },
  ]]);
});
