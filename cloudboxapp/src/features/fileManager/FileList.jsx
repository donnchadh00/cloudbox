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
        <div className="mt-6">
            <div className="hidden md:grid md:grid-cols-[minmax(0,1fr)_180px_100px_220px] md:gap-4 md:px-2 md:pb-3 text-xs font-semibold tracking-wide text-gray-500 uppercase">
                <span>Name</span>
                <span>Modified</span>
                <span>Size</span>
                <span className="text-right">Actions</span>
            </div>
            <ul className="border-t border-gray-200 divide-y divide-gray-200">
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
        </div>
    );
}
