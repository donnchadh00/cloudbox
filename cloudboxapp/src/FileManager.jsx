import { useState, useEffect } from 'react'
import { ClipLoader } from 'react-spinners';
import defaultFileIcon from './assets/icon-doc.svg';
import toast from 'react-hot-toast';
import { fetchAuthSession } from 'aws-amplify/auth';
import { formatFileSize, formatDate } from './utils/formatters.js';

const API_URL = 'https://ug5wefhwv5.execute-api.eu-north-1.amazonaws.com/v4/files'

export default function FileManager() {
  const [files, setFiles] = useState([])
  const [loadingList, setLoadingList] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [deletingFile, setDeletingFile] = useState(null)
  const [downloadingFile, setDownloadingFile] = useState(null);
  const [previews, setPreviews] = useState({});
  const [isDragging, setIsDragging] = useState(false);
  const [filesToUpload, setFilesToUpload] = useState([]);
  const [userEmail, setUserEmail] = useState('');

  const getImagePreviewUrl = async (fileName) => {
    const session = await fetchAuthSession()
    const token = session.tokens?.idToken?.toString();
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

  const fetchFiles = async () => {
    setLoadingList(true)
    const session = await fetchAuthSession()
    const token = session.tokens?.idToken?.toString();

    if (!token) {
      throw new Error('No valid auth token found');
    }

    console.log("token is: " + token)

    try {
      const res = await fetch(API_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
    });
      const data = await res.json()
      setFiles(data.files || [])
    } catch (err) {
      console.error('Error fetching files:', err)
      toast.error('Failed to load file list');
    } finally {
      setLoadingList(false)
    }
  }

  const uploadFiles = async () => {
    setUploading(true);

    let token;
    try {
      const session = await fetchAuthSession();
      token = session.tokens?.idToken?.toString();

      if (!token) {
        throw new Error('Authentication token not found');
      }
    } catch (err) {
      toast.error('User authentication failed');
      console.error('Auth error:', err);
      setUploading(false);
      return;
    }

    for (const file of filesToUpload) {
      try {
        const reader = new FileReader();

        await new Promise((resolve, reject) => {
          reader.onloadend = async () => {
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
            toast.success(`Uploaded: ${file.name}`);
            resolve();
          };

          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      } catch (err) {
        console.error('Error uploading:', err);
        toast.error(`Failed to upload ${file.name}`);
      }
    }

    setUploading(false);
    setFilesToUpload([]);
    fetchFiles();
  };

  const deleteFile = async (fileName) => {
    setDeletingFile(fileName)
    const session = await fetchAuthSession()
    const token = session.tokens?.idToken?.toString();
    try {
      const res = await fetch(`${API_URL}/${encodeURIComponent(fileName)}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
    });

      const data = await res.json()
      console.log(data.message)
      toast.success(`Deleted ${fileName}`);
      fetchFiles()
    } catch (err) {
      console.error('Delete failed:', err)
      toast.error('Failed to delete file');
    } finally {
      setDeletingFile(null)
    }
  }

  const handleDownload = async (fileName) => {
    setDownloadingFile(fileName);
    const session = await fetchAuthSession()
    const token = session.tokens?.idToken?.toString();
    try {
      const res = await fetch(`${API_URL}/${encodeURIComponent(fileName)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
    });
      const data = await res.json();
      const url = data.url;

      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Download started');
    } catch (err) {
      console.error('Error downloading file:', err);
      alert('Failed to download file');
      toast.error('Download failed');
    } finally {
      setDownloadingFile(null);
    }
  };

  useEffect(() => {
    const getUserEmail = async () => {
      try {
        const session = await fetchAuthSession();
        const email = session.tokens?.idToken?.payload?.email;
        if (email) {
          setUserEmail(email);
        }
      } catch (err) {
        console.error('Failed to get user email:', err);
      }
    };

    getUserEmail();
  }, []);

  useEffect(() => {
    const fetchPreviews = async () => {
      const imageFiles = files.filter(f =>
        f.key.match(/\.(jpg|jpeg|png|gif|webp)$/i)
      );

      const entries = await Promise.all(
        imageFiles.map(async (f) => {
          const url = await getImagePreviewUrl(f.key);
          return [f.key, url];
        })
      );

      setPreviews(Object.fromEntries(entries));
    };

    if (files.length) fetchPreviews();
  }, [files]);

  useEffect(() => {
    fetchFiles()
  }, [])

  return (
    <div className="p-4">
      <h2 className="text-3xl font-semibold text-gray-800 mb-6 border-b pb-2">
        📁 File Manager
        {userEmail && (
          <span className="text-base font-normal text-gray-500">
            ({userEmail})
          </span>
        )}
      </h2>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          const droppedFiles = Array.from(e.dataTransfer.files);
          if (droppedFiles.length) {
            setFilesToUpload(droppedFiles);
          }
        }}
        className={`border-2 border-dashed rounded p-6 flex flex-col items-center justify-center ${
          isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        }`}
      >
        <p className="text-sm mb-3 text-gray-600">
          Drag & drop a file here or use the file picker below
        </p>

        <input
          type="file"
          multiple
          onChange={(e) => setFilesToUpload(Array.from(e.target.files))}
          className="hidden"
          id="fileInput"
        />
        <label
          htmlFor="fileInput"
          className="inline-block px-4 py-2 bg-gray-100 hover:bg-gray-200 text-sm rounded cursor-pointer"
        >
          Choose File
        </label>

        {filesToUpload.length > 0 && (
          <ul className="mt-2 text-sm text-gray-600 list-disc list-inside">
            {filesToUpload.map((f) => (
              <li key={f.name}>{f.name}</li>
            ))}
          </ul>
        )}
        
        <button
          onClick={uploadFiles}
          disabled={!filesToUpload.length === 0 || uploading}
          className={`mt-4 px-4 py-2 rounded text-white ${
            !files || uploading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
      </div>

      {loadingList ? (
        <ClipLoader size={20} color="#3b82f6" />
      ) : (
        <ul className="mt-6 divide-y divide-gray-200">
          {files.map((file) => (
            <li key={file.key} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-4">
                <img
                  src={previews[file.key] || defaultFileIcon}
                  alt={file.key}
                  title={file.key}
                  className="w-12 h-12 object-cover rounded border"
                />
                <span className="font-medium text-gray-800">{file.key.split('/').pop()}</span>
              </div>

              <div className="text-gray-500 text-sm">
                {formatDate(file.lastModified)}
              </div>

              <div className="flex items-center gap-4">
                <span className="text-gray-600 text-sm">
                  {formatFileSize(file.size)}
                </span>

                {deletingFile === file.key ? (
                  <span className="ml-2 text-sm text-red-500 animate-pulse">Deleting...</span>
                ) : (
                  <button
                    onClick={() => deleteFile(file.key.split('/').pop())}
                    className="ml-2 px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                )}

                {downloadingFile === file.key ? (
                  <span className="ml-2 text-sm text-gray-500 animate-pulse">Downloading...</span>
                ) : (
                  <button
                    onClick={() => handleDownload(file.key)}
                    className="ml-2 px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Download
                  </button>
                )}

              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
