import { useState } from 'react';

export default function FileUpoader({
    filesToUpload,
    setFilesToUpload,
    uploadFiles,
    uploading,
    files,
}) {
    const [isDragging, setIsDragging] = useState(false);

    const isDraggingClass = (isDragging) =>
        `border-2 border-dashed rounded p-6 flex flex-col items-center justify-center ${
            isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        }`;

    const handleDrop = (e) => {
        e.preventDefault();
        const droppedFiles = Array.from(e.dataTransfer.files);
        if (droppedFiles.length) {
            setFilesToUpload(droppedFiles);
        }
    }

    return (
        <div
            onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
                setIsDragging(false);
                handleDrop(e);
            }}
            className={isDraggingClass(isDragging)}
        >
            <p className="text-sm mb-3 text-gray-600">
                Drag & drop a file here or use the file picker below
            </p>

            <input
                type="file"
                multiple
                onChange={(e) => setFilesToUpload(Array.from(e.target.files))}
                className="hidden"
                id="fileInput"
            />
            <label
                htmlFor="fileInput"
                className="inline-block px-4 py-2 bg-gray-100 hover:bg-gray-200 text-sm rounded cursor-pointer"
            >
                Choose File
            </label>

            {filesToUpload.length > 0 && (
                <ul className="mt-2 text-sm text-gray-600 list-disc list-inside">
                {filesToUpload.map((f) => (
                    <li key={f.name}>{f.name}</li>
                ))}
                </ul>
            )}
            
            <button
                onClick={uploadFiles}
                disabled={!filesToUpload.length === 0 || uploading}
                className={`mt-4 px-4 py-2 rounded text-white ${
                !files || uploading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
            >
                {uploading ? 'Uploading...' : 'Upload'}
            </button>
        </div>
    );
}
