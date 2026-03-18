import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getDeleteFileName,
  getDisplayFileName,
  getDownloadFileKey,
  getPreviewFileKey,
} from './fileContract.js';

test('display name returns basename for listed files', () => {
  assert.equal(getDisplayFileName('user-123/photos/cat.png'), 'cat.png');
});

test('preview and download keep the full listed key contract', () => {
  const file = { key: 'user-123/cat.png' };

  assert.equal(getPreviewFileKey(file), 'user-123/cat.png');
  assert.equal(getDownloadFileKey(file), 'user-123/cat.png');
});

test('delete uses basename only', () => {
  const file = { key: 'user-123/cat.png' };

  assert.equal(getDeleteFileName(file), 'cat.png');
});
