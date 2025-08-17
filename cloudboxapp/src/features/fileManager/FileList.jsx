import FileItem from "./FileItem"      
import { ClipLoader } from 'react-spinners';

export default function FileList({
    files,
    previews,
    deletingFile,
    downloadingFile,
    onDelete,
    onDownload,
    loading,
}) {
    if (loading) {
        return <ClipLoader size={20} color="#3b82f6" />
     } 
     
     return (
        <ul className="mt-6 divide-y divide-gray-200">
            {files.map((file) => (
                <FileItem
                    key={file.key}
                    file={file}
                    preview={previews[file.key]}
                    onDelete={onDelete}
                    onDownload={onDownload}
                    deletingFile={deletingFile}
                    downloadingFile={downloadingFile}
                />
            ))}
        </ul>
    );
}
