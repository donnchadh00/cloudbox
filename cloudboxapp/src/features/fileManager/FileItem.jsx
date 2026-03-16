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
        <li className="py-3 md:grid md:grid-cols-[minmax(0,1fr)_180px_100px_220px] md:gap-4 md:items-center">
            <div className="flex items-center gap-4 min-w-0">
                <img
                    src={preview || defaultFileIcon}
                    alt={fileName}
                    title={fileName}
                    className="w-12 h-12 object-cover rounded border"
                />
                <div className="min-w-0">
                    <div className="text-xs font-semibold tracking-wide text-gray-500 uppercase md:hidden">
                        Name
                    </div>
                    <span className="block truncate font-medium text-gray-800">{fileName}</span>
                </div>
            </div>

            <div className="mt-3 text-gray-500 text-sm md:mt-0">
                <div className="text-xs font-semibold tracking-wide text-gray-500 uppercase md:hidden">
                    Modified
                </div>
                {formatDate(file.lastModified)}
            </div>

            <div className="mt-3 md:mt-0">
                <div className="text-xs font-semibold tracking-wide text-gray-500 uppercase md:hidden">
                    Size
                </div>
                <span className="text-gray-600 text-sm">
                    {formatFileSize(file.size)}
                </span>
            </div>

            <div className="mt-3 flex items-center gap-4 md:mt-0 md:justify-end">
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
