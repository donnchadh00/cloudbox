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
        `rounded-xl border-2 border-dashed p-6 flex flex-col items-center justify-center text-center shadow-sm transition-all ${
            isDragging
                ? 'border-blue-500 bg-blue-50 shadow-blue-100/80'
                : 'border-slate-300 bg-slate-50'
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
            {/* <p className="text-sm font-semibold text-slate-800">
                Drop files here
            </p> */}
            <p className="mt-1.5 mb-4 max-w-md text-sm leading-5 text-slate-600">
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
                className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-100 cursor-pointer"
            >
                Choose File
            </label>

            {filesToUpload.length > 0 && (
                <ul className="mt-3 w-full max-w-md rounded-lg border border-slate-200 bg-white/80 px-4 py-3 text-left text-sm text-slate-600 shadow-sm">
                {filesToUpload.map((f) => (
                    <li key={f.name} className="truncate py-1">{f.name}</li>
                ))}
                </ul>
            )}
            
            <button
                onClick={uploadFiles}
                disabled={!filesToUpload.length === 0 || uploading}
                className={`mt-4 rounded-lg px-4 py-2 text-sm font-medium text-white shadow-sm transition ${
                !files || uploading
                    ? 'bg-slate-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
            >
                {uploading ? 'Uploading...' : 'Upload'}
            </button>
        </div>
    );
}
