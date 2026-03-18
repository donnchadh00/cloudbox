function getScopedFileKey({ userId, encodedFileName }) {
  const key = decodeURIComponent(encodedFileName || '');

  if (!userId) {
    return {
      statusCode: 401,
      body: { error: 'Unauthorized: user ID missing' },
    };
  }

  if (!key) {
    return {
      statusCode: 400,
      body: { error: 'Missing file name' },
    };
  }

  if (!key.startsWith(`${userId}/`)) {
    return {
      statusCode: 403,
      body: { error: 'Forbidden: file key is outside user scope' },
    };
  }

  return { key };
}

module.exports = {
  getScopedFileKey,
};
