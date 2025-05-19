
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Upload, File, X } from 'lucide-react';
import { toast } from '@/components/ui/sonner';

interface DocumentUploadProps {
  onUpload: (document: DocumentFile) => void;
}

export interface DocumentFile {
  id: string;
  name: string;
  type: string;
  size: number;
  dataUrl: string;
  timestamp: string;
}

const ACCEPTED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'application/rtf',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const DocumentUpload = ({ onUpload }: DocumentUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<DocumentFile | null>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (!file) return;
    
    if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
      toast.error('Invalid file type. Please upload PDF, Word, Excel, PowerPoint, or text documents.');
      return;
    }
    
    if (file.size > MAX_FILE_SIZE) {
      toast.error('File is too large. Maximum size is 10MB.');
      return;
    }
    
    setIsUploading(true);
    setUploadProgress(0);
    
    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        const newProgress = prev + 10;
        if (newProgress >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return newProgress;
      });
    }, 200);
    
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      
      const documentFile: DocumentFile = {
        id: `doc_${Date.now()}`,
        name: file.name,
        type: file.type,
        size: file.size,
        dataUrl,
        timestamp: new Date().toISOString(),
      };
      
      setSelectedFile(documentFile);
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      setTimeout(() => {
        setIsUploading(false);
        onUpload(documentFile);
        toast.success('Document uploaded successfully');
      }, 300);
    };
    
    reader.onerror = () => {
      clearInterval(progressInterval);
      setIsUploading(false);
      setUploadProgress(0);
      toast.error('Failed to read file. Please try again.');
    };
    
    reader.readAsDataURL(file);
  };
  
  const handleRemove = () => {
    setSelectedFile(null);
  };
  
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Upload Document</p>
        <p className="text-xs text-muted-foreground">
          Supports PDF, Word, Excel, PowerPoint, and text files (max 10MB)
        </p>
      </div>
      
      {!selectedFile && (
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-muted-foreground/30 rounded-lg cursor-pointer bg-muted/10 hover:bg-muted/20 transition-colors">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="mb-2 text-sm text-center text-muted-foreground">
              <span className="font-medium">Click to upload</span> or drag and drop
            </p>
          </div>
          <input 
            type="file" 
            className="hidden" 
            onChange={handleFileChange} 
            accept={ACCEPTED_FILE_TYPES.join(',')}
          />
        </label>
      )}
      
      {isUploading && (
        <div className="w-full p-4 bg-background rounded-lg border border-border">
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm font-medium">Uploading...</p>
            <p className="text-xs text-muted-foreground">{uploadProgress}%</p>
          </div>
          <Progress value={uploadProgress} className="h-2" />
        </div>
      )}
      
      {selectedFile && !isUploading && (
        <div className="flex items-center p-3 bg-muted/20 rounded-lg border border-border">
          <File className="h-8 w-8 mr-3 text-primary" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{selectedFile.name}</p>
            <p className="text-xs text-muted-foreground">
              {formatFileSize(selectedFile.size)}
            </p>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="ml-2" 
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};
