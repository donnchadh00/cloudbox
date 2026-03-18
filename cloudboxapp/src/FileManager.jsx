import { useState, useEffect } from 'react'
import toast from 'react-hot-toast';
import {
  fetchFileList,
  uploadFileToS3,
  deleteListedFile,
  getDisplayFileName,
  getDownloadUrlForFile,
  getAuthToken,
} from './services/s3Service';
import FileUploader from './features/fileManager/FileUploader.jsx';
import FileList from './features/fileManager/FileList.jsx';

export default function FileManager() {
  const [files, setFiles] = useState([])
  const [loadingList, setLoadingList] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [deletingFile, setDeletingFile] = useState(null)
  const [downloadingFile, setDownloadingFile] = useState(null);
  const [previews, setPreviews] = useState({});
  const [filesToUpload, setFilesToUpload] = useState([]);

  const fetchFiles = async () => {
    setLoadingList(true)
    try {
      const files = await fetchFileList();
      setFiles(files)
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
      token = await getAuthToken();
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
        await uploadFileToS3(file, token);
        toast.success(`Uploaded: ${file.name}`);
      } catch (err) {
        console.error('Error uploading:', err);
        toast.error(`Failed to upload ${file.name}`);
      }
    }

    setUploading(false);
    setFilesToUpload([]);
    fetchFiles();
  };

  const deleteFile = async (file) => {
    const fileName = getDisplayFileName(file);
    setDeletingFile(fileName)
    try {
      await deleteListedFile(file);
      toast.success(`Deleted ${fileName}`);
      fetchFiles()
    } catch (err) {
      console.error('Delete failed:', err)
      toast.error('Failed to delete file');
    } finally {
      setDeletingFile(null)
    }
  }

  const handleDownload = async (file) => {
    setDownloadingFile(file.key);
    
    try {
      const url = await getDownloadUrlForFile(file);
      const fileName = getDisplayFileName(file);

      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Download started');
    } catch (err) {
      console.error('Error downloading file:', err);
      toast.error('Download failed');
    } finally {
      setDownloadingFile(null);
    }
  };

  useEffect(() => {
    if (files.length) {
      setPreviews(
        Object.fromEntries(
          files
            .filter((file) => file.previewUrl)
            .map((file) => [file.key, file.previewUrl])
        )
      );
      return;
    }

    setPreviews({});
  }, [files]);

  useEffect(() => {
    fetchFiles()
  }, [])

  return (
    <div className="p-4">    
      
      <FileUploader
        filesToUpload={filesToUpload}
        setFilesToUpload={setFilesToUpload}
        uploadFiles={uploadFiles}
        uploading={uploading}
      />

      <FileList
        files={files}
        previews={previews}
        deletingFile={deletingFile}
        downloadingFile={downloadingFile}
        onDelete={deleteFile}
        onDownload={handleDownload}
        loading={loadingList}
      />

    </div>
  )
}
