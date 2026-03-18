const test = require('node:test');
const assert = require('node:assert/strict');
const { getScopedFileKey } = require('./logic');

test('allows full user-scoped keys', () => {
  assert.deepEqual(
    getScopedFileKey({
      userId: 'user-123',
      encodedFileName: 'user-123/cat.png',
    }),
    { key: 'user-123/cat.png' }
  );
});

test('rejects missing keys', () => {
  assert.deepEqual(
    getScopedFileKey({
      userId: 'user-123',
      encodedFileName: '',
    }),
    {
      statusCode: 400,
      body: { error: 'Missing file name' },
    }
  );
});

test('rejects keys outside the authenticated user prefix', () => {
  assert.deepEqual(
    getScopedFileKey({
      userId: 'user-123',
      encodedFileName: 'other-user/cat.png',
    }),
    {
      statusCode: 403,
      body: { error: 'Forbidden: file key is outside user scope' },
    }
  );
});
