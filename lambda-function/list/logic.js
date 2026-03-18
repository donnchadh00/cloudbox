const previewableImagePattern = /\.(jpg|jpeg|png|gif|webp)$/i;

function isPreviewableImageKey(key) {
  return previewableImagePattern.test(key);
}

function mapS3ObjectToFile(item, { bucketName, getSignedUrl }) {
  return {
    key: item.Key,
    size: item.Size,
    lastModified: item.LastModified,
    previewUrl: isPreviewableImageKey(item.Key)
      ? getSignedUrl('getObject', {
          Bucket: bucketName,
          Key: item.Key,
          Expires: 60,
        })
      : null,
  };
}

module.exports = {
  isPreviewableImageKey,
  mapS3ObjectToFile,
};
