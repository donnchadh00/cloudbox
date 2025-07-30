import { useState, useEffect } from 'react'
import { ClipLoader } from 'react-spinners';
import { useRef } from 'react';

const API_URL = 'https://ug5wefhwv5.execute-api.eu-north-1.amazonaws.com/v3/files'

export default function FileManager() {
  const [files, setFiles] = useState([])
  const [file, setFile] = useState(null)
  const [loadingList, setLoadingList] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [deletingFile, setDeletingFile] = useState(null)
  const fileInputRef = useRef();

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

  useEffect(() => {
    fetchFiles()
  }, [])

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">File Manager</h2>

      <div className="mb-4">
        <input type="file"
          ref={fileInputRef}
          onChange={(e) => setFile(e.target.files[0])} 
        />
        <button
          onClick={uploadFile}
          className="ml-2 px-4 py-2 bg-blue-500 text-white rounded"
          disabled={!file || uploading}
        >
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
      </div>

      {loadingList ? (
        <ClipLoader size={20} color="#3b82f6" />
      ) : (
        <ul className="mt-6 space-y-2">
          {files.map((f) => (
            <li key={f} className="flex items-center">
              {f}
              <button
                onClick={() => deleteFile(f)}
                className="ml-2 px-2 py-1 bg-red-500 text-white rounded"
                disabled={deletingFile === f}
              >
                {deletingFile === f ? 'Deleting...' : 'Delete'}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
