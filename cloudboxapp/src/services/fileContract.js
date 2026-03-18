function getFileKey(fileOrKey) {
  return typeof fileOrKey === 'string' ? fileOrKey : fileOrKey.key;
}

export function getDisplayFileName(fileOrKey) {
  const fileKey = getFileKey(fileOrKey);
  return fileKey.split('/').pop() ?? fileKey;
}

export function getPreviewFileKey(fileOrKey) {
  return getFileKey(fileOrKey);
}

export function getDownloadFileKey(fileOrKey) {
  return getFileKey(fileOrKey);
}

export function getDeleteFileName(fileOrKey) {
  return getDisplayFileName(fileOrKey);
}
