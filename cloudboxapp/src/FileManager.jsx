import { useState, useEffect } from 'react'
import { ClipLoader } from 'react-spinners';
import { useRef } from 'react';
import defaultFileIcon from './assets/file-icon.svg';

const API_URL = 'https://ug5wefhwv5.execute-api.eu-north-1.amazonaws.com/v3/files'

export default function FileManager() {
  const [files, setFiles] = useState([])
  const [file, setFile] = useState(null)
  const [loadingList, setLoadingList] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [deletingFile, setDeletingFile] = useState(null)
  const [downloadingFile, setDownloadingFile] = useState(null);
  const fileInputRef = useRef();
  const [previews, setPreviews] = useState({});

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(dateStr) {
  const date = new Date(dateStr)
  return date.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

  const getImagePreviewUrl = async (fileName) => {
    const res = await fetch(`${API_URL}/${encodeURIComponent(fileName)}`);
    const data = await res.json();
    return data.url;
  };

  const fetchFiles = async () => {
    setLoadingList(true)
    try {
      const res = await fetch(API_URL)
      const data = await res.json()
      setFiles(data.files || [])
    } catch (err) {
      console.error('Error fetching files:', err)
    } finally {
      setLoadingList(false)
    }
  }

  const uploadFile = async () => {
    if (!file) return
    setUploading(true)

    const reader = new FileReader()
    reader.onloadend = async () => {
      const base64 = reader.result.split(',')[1]

      try {
        const res = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            fileName: file.name,
            fileContent: base64
          })
        })

        const data = await res.json()
        console.log(data.message)
        fetchFiles()
      } catch (err) {
        console.error('Upload failed:', err)
      } finally {
        setUploading(false)
        fileInputRef.current.value = '';
        setFile(null)
      }
    }

    reader.readAsDataURL(file)
  }

  const deleteFile = async (fileName) => {
    setDeletingFile(fileName)
    try {
      const res = await fetch(`${API_URL}/${encodeURIComponent(fileName)}`, {
        method: 'DELETE'
      })

      const data = await res.json()
      console.log(data.message)
      fetchFiles()
    } catch (err) {
      console.error('Delete failed:', err)
    } finally {
      setDeletingFile(null)
    }
  }

  const handleDownload = async (fileName) => {
    setDownloadingFile(fileName);

    try {
      const res = await fetch(`${API_URL}/${encodeURIComponent(fileName)}`);
      const data = await res.json();
      const url = data.url;

      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error downloading file:', err);
      alert('Failed to download file');
    } finally {
      setDownloadingFile(null);
    }
  };

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
      </h2>

      <div className="flex items-center gap-4 mt-6">
        {/* Choose File Button */}
        <label className="relative inline-block cursor-pointer bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Choose File
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
        </label>

        {/* File Name Display */}
        <div className="text-sm text-gray-600 border border-gray-300 rounded px-3 py-2 w-64 truncate">
          {file ? file.name : 'No file chosen'}
        </div>

        {/* Upload Button */}
        <button
          onClick={uploadFile}
          disabled={!file || uploading}
          className={`px-4 py-2 rounded text-white ${
            !file || uploading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700'
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
                <span className="font-medium text-gray-800">{file.key}</span>
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
                    onClick={() => deleteFile(file.key)}
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
