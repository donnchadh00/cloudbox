import { fetchAuthSession } from 'aws-amplify/auth';
import { apiUrl } from '../config/appConfig';

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

export async function getAuthToken() {
    const session = await fetchAuthSession()
    return session.tokens?.idToken?.toString();
}

export async function fetchFileList() {
    const token = await getAuthToken();
    if (!token) {
        throw new Error('No valid auth token found');
    }

    const res = await fetch(apiUrl, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    });
    const data = await res.json();
    return data.files || [];
}

export async function uploadFileToS3(file, token) {
    const signedUrlResponse = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            fileName: file.name,
            contentType: file.type || 'application/octet-stream',
        }),
    });

    const signedUrlData = await signedUrlResponse.json();
    if (!signedUrlResponse.ok || !signedUrlData.uploadUrl) {
        throw new Error(signedUrlData.error || 'Could not create upload URL');
    }

    const uploadResponse = await fetch(signedUrlData.uploadUrl, {
        method: 'PUT',
        headers: {
            'Content-Type': file.type || 'application/octet-stream',
        },
        body: file,
    });

    if (!uploadResponse.ok) {
        throw new Error('Direct upload to storage failed');
    }

    return signedUrlData;
};

export const deleteFileFromS3 = async (fileName) => {
    const token = await getAuthToken();

    const res = await fetch(`${apiUrl}/${encodeURIComponent(fileName)}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    });

    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Delete failed');
    return data;
}

export const deleteListedFile = async (fileOrKey) => {
    return deleteFileFromS3(getDeleteFileName(fileOrKey));
}

export const getDownloadUrl = async (fileName) => {
    const token = await getAuthToken();

    const res = await fetch(`${apiUrl}/${encodeURIComponent(fileName)}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    });

    const data = await res.json();
    if (!res.ok || !data.url) throw new Error(data.error || 'Download URL fetch failed');
    return data.url;
};

export const getDownloadUrlForFile = async (fileOrKey) => {
    return getDownloadUrl(getDownloadFileKey(fileOrKey));
}

export const getFilePreviewUrl = async (fileName) => {
    const token = await getAuthToken();
    const res = await fetch(`${apiUrl}/${encodeURIComponent(fileName)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
    });
    const data = await res.json();
    return data.url;
};

export const getFilePreviewUrlForFile = async (fileOrKey) => {
    return getFilePreviewUrl(getPreviewFileKey(fileOrKey));
}
