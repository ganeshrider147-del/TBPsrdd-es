import React from 'react';

const FileUpload = ({ label, accept = 'image/*', onChange, fileName, error }) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="font-label-md text-label-md text-on-surface-variant">{label}</label>
        {fileName && <span className="text-sm text-on-surface-variant">{fileName}</span>}
      </div>
      <label className="flex min-h-[180px] flex-col items-center justify-center rounded-3xl border border-dashed border-outline-variant bg-surface-container p-6 text-center transition hover:border-primary/80 hover:bg-surface-container-high cursor-pointer">
        <span className="material-symbols-outlined text-4xl text-primary">cloud_upload</span>
        <span className="mt-3 text-body-md text-on-surface">Upload an image</span>
        <span className="text-sm text-on-surface-variant mt-1">PNG or JPG, max 10MB</span>
        <input type="file" accept={accept} className="sr-only" onChange={onChange} />
      </label>
      {error && <p className="text-error text-sm">{error}</p>}
    </div>
  );
};

export default FileUpload;
