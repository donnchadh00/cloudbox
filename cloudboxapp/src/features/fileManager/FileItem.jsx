import { formatDate, formatFileSize } from '../../utils/formatters';
import defaultFileIcon from '../../assets/icon-doc.svg';

export default function FileItem({
    file,
    preview,
    onDelete,
    onDownload,
    deletingFile,
    downloadingFile,
}) {
    const fileName = file.key.split('/').pop();

    return (
        <li className="flex items-center justify-between py-3">
            <div className="flex items-center gap-4">
                <img
                    src={preview || defaultFileIcon}
                    alt={fileName}
                    title={fileName}
                    className="w-12 h-12 object-cover rounded border"
                />
                <span className="font-medium text-gray-800">{fileName}</span>
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
                    onClick={() => onDelete(file.key.split('/').pop())}
                    className="ml-2 px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                    Delete
                    </button>
                )}

                {downloadingFile === file.key ? (
                    <span className="ml-2 text-sm text-gray-500 animate-pulse">Downloading...</span>
                ) : (
                    <button
                    onClick={() => onDownload(file.key)}
                    className="ml-2 px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                    Download
                    </button>
                )}
            </div>
        </li>
    );
}
