import { fetchAuthSession } from 'aws-amplify/auth';

const API_URL = 'https://ug5wefhwv5.execute-api.eu-north-1.amazonaws.com/v4/files'

export async function getAuthToken() {
    const session = await fetchAuthSession()
    return session.tokens?.idToken?.toString();
}

export async function fetchFileList() {
    const token = await getAuthToken();
    if (!token) {
        throw new Error('No valid auth token found');
    }
    console.log("token is: " + token)

    const res = await fetch(API_URL, {
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
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onloadend = async () => {
            try {
                const base64 = reader.result.split(',')[1];
                const res = await fetch(API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        fileName: file.name,
                        fileContent: base64,
                    }),
                });

                const data = await res.json();
                if (!res.ok) throw new Error(data.error || 'Upload failed');
                resolve(data);
            } catch (err) {
                reject(err);
            }
        };

        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

export const deleteFileFromS3 = async (fileName) => {
    const token = await getAuthToken();

    const res = await fetch(`${API_URL}/${encodeURIComponent(fileName)}`, {
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

export const getFilePreviewUrl = async (fileName) => {
    const token = await getAuthToken();
    const res = await fetch(`${API_URL}/${encodeURIComponent(fileName)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
    });
    const data = await res.json();
    return data.url;
};
