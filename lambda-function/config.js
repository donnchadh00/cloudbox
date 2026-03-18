function getRequiredEnvVar(name) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function getStorageBucketName() {
  return getRequiredEnvVar('CLOUDBOX_STORAGE_BUCKET');
}

module.exports = {
  getStorageBucketName,
};
