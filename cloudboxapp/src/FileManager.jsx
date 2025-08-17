import { useState, useEffect } from 'react'
import toast from 'react-hot-toast';
import { fetchAuthSession } from 'aws-amplify/auth';
import {
  fetchFileList,
  uploadFileToS3,
  deleteFileFromS3,
  getDownloadUrl,
  getFilePreviewUrl,
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
  const [userEmail, setUserEmail] = useState('');

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

  const deleteFile = async (fileName) => {
    setDeletingFile(fileName)
    try {
      await deleteFileFromS3(fileName);
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
    
    try {
      const url = await getDownloadUrl(fileName);

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
          const url = await getFilePreviewUrl(f.key);
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
      
      <FileUploader
        filesToUpload={filesToUpload}
        setFilesToUpload={setFilesToUpload}
        uploadFiles={uploadFiles}
        uploading={uploading}
        files={files}
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
