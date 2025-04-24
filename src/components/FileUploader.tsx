
import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploaderProps {
  onFileUpload: (file: File) => void;
  currentFile: File | null;
}

const FileUploader = ({ onFileUpload, currentFile }: FileUploaderProps) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileUpload(acceptedFiles[0]);
    }
  }, [onFileUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 1
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
        isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-blue-400",
      )}
    >
      <input {...getInputProps()} />
      
      <div className="flex flex-col items-center justify-center">
        {currentFile ? (
          <>
            <File className="h-12 w-12 text-blue-500 mb-4" />
            <p className="text-sm font-medium text-gray-900">{currentFile.name}</p>
            <p className="text-xs text-gray-500 mt-1">
              Click or drag to replace the file
            </p>
          </>
        ) : (
          <>
            <Upload className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-sm font-medium text-gray-900">
              {isDragActive ? "Drop your resume here" : "Upload your resume"}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Supports PDF, DOC, and DOCX files
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default FileUploader;
