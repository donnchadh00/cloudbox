import { useState, useEffect } from 'react'

const API_URL = 'https://ug5wefhwv5.execute-api.eu-north-1.amazonaws.com/v3/files'

export default function FileManager() {
  const [files, setFiles] = useState([])
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)

  const fetchFiles = async () => {
    try {
      const res = await fetch(API_URL)
      const data = await res.json()
      setFiles(data.files || [])
    } catch (err) {
      console.error('Error fetching files:', err)
    }
  }

  const uploadFile = async () => {
    if (!file) return
    setLoading(true)

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
        setLoading(false)
        setFile(null)
      }
    }

    reader.readAsDataURL(file)
  }

  const deleteFile = async (fileName) => {
    setLoading(true)
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
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFiles()
  }, [])

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">File Manager</h2>

      <div className="mb-4">
        <input type="file" onChange={(e) => setFile(e.target.files[0])} />
        <button
          onClick={uploadFile}
          className="ml-2 px-4 py-2 bg-blue-500 text-white rounded"
          disabled={!file || loading}
        >
          {loading ? 'Uploading...' : 'Upload'}
        </button>
      </div>

      <ul className="mt-6 space-y-2">
        {files.map((f) => (
          <li key={f}>
            {f}
            <button
              onClick={() => deleteFile(f)}
              className="ml-2 px-2 py-1 bg-red-500 text-white rounded"
              disabled={loading}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
