import React from "react";
import { useDropzone } from "react-dropzone";
import Image from "next/image";

type Props = {
  onUpload: (files: File[]) => void;
};

const ImageDropzone: React.FC<Props> = ({ onUpload }) => {
  const onDrop = (acceptedFiles: File[]) => {
    if (!acceptedFiles.length) return;
    onUpload(acceptedFiles);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/png": [],
      "image/jpeg": [],
      "image/webp": [],
      "image/svg+xml": [],
    },
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
        isDragActive
          ? "border-blue-500 bg-blue-50"
          : "border-gray-300 hover:border-gray-400"
      }`}
    >
      <input {...getInputProps()} />

      <div className="flex flex-col items-center">
        <svg
          className="w-12 h-12 text-gray-400 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>

        <p className="text-lg font-medium text-gray-700 mb-2">
          {isDragActive ? "Drop images here" : "Drag & drop images here"}
        </p>
        <p className="text-sm text-gray-500">or click to browse files</p>
      </div>
    </div>
  );
};

export default ImageDropzone;
