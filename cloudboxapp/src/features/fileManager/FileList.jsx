import { useState } from 'react';
import FileItem from "./FileItem"      
import { ClipLoader } from 'react-spinners';

const sortableColumns = [
    { key: 'name', label: 'Name' },
    { key: 'modified', label: 'Modified' },
    { key: 'size', label: 'Size' },
];

export default function FileList({
    files,
    previews,
    deletingFile,
    downloadingFile,
    onDelete,
    onDownload,
    getFileName,
    loading,
}) {
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

    if (loading) {
        return <ClipLoader size={20} color="#3b82f6" />
    }

    const handleSort = (key) => {
        setSortConfig((current) => {
            if (current.key === key) {
                return {
                    key,
                    direction: current.direction === 'asc' ? 'desc' : 'asc',
                };
            }

            return {
                key,
                direction: 'asc',
            };
        });
    };

    const sortedFiles = [...files].sort((a, b) => {
        if (!sortConfig.key) return 0;

        let comparison = 0;

        if (sortConfig.key === 'name') {
            const aName = a.key.split('/').pop() ?? '';
            const bName = b.key.split('/').pop() ?? '';
            comparison = aName.localeCompare(bName, undefined, { sensitivity: 'base' });
        }

        if (sortConfig.key === 'modified') {
            comparison = new Date(a.lastModified).getTime() - new Date(b.lastModified).getTime();
        }

        if (sortConfig.key === 'size') {
            comparison = a.size - b.size;
        }

        return sortConfig.direction === 'asc' ? comparison : comparison * -1;
    });

    const getSortIndicator = (key) => {
        if (sortConfig.key !== key) return '';
        return sortConfig.direction === 'asc' ? ' ↑' : ' ↓';
    };
     
     return (
        <div className="mt-6">
            <div className="hidden md:grid md:grid-cols-[minmax(0,1fr)_180px_100px_220px] md:gap-4 md:px-2 md:pb-3 text-xs font-semibold tracking-wide text-gray-500 uppercase">
                {sortableColumns.map((column) => (
                    <button
                        key={column.key}
                        type="button"
                        onClick={() => handleSort(column.key)}
                        className="text-left hover:text-gray-700 transition"
                    >
                        {column.label}
                        <span aria-hidden="true">{getSortIndicator(column.key)}</span>
                    </button>
                ))}
                <span className="text-right">Actions</span>
            </div>
            <ul className="border-t border-gray-200 divide-y divide-gray-200">
            {sortedFiles.map((file) => (
                <FileItem
                    key={file.key}
                    file={file}
                    preview={previews[file.key]}
                    onDelete={onDelete}
                    onDownload={onDownload}
                    getFileName={getFileName}
                    deletingFile={deletingFile}
                    downloadingFile={downloadingFile}
                />
            ))}
            </ul>
        </div>
    );
}
