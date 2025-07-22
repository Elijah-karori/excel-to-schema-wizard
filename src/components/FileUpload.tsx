import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileSpreadsheet, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface FileUploadProps {
  onFileProcessed: (sqlSchema: string, fileName: string) => void;
  isProcessing: boolean;
}

export function FileUpload({ onFileProcessed, isProcessing }: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setSelectedFile(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    multiple: false,
    disabled: isProcessing
  });

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      // Simulate API call for demo - replace with actual API endpoint
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      // Mock SQL schema generation
      const mockSchema = `CREATE TABLE \`${selectedFile.name.split('.')[0]}\` (
  \`id\` INTEGER PRIMARY KEY,
  \`name\` VARCHAR(255),
  \`email\` VARCHAR(255),
  \`created_at\` DATETIME,
  \`status\` VARCHAR(50)
);

CREATE TABLE \`products\` (
  \`product_id\` INTEGER PRIMARY KEY,
  \`product_name\` VARCHAR(255),
  \`price\` DECIMAL(10,2),
  \`category\` VARCHAR(100),
  \`in_stock\` BOOLEAN
);`;

      setTimeout(() => {
        onFileProcessed(mockSchema, selectedFile.name);
        toast({
          title: "Schema Generated Successfully",
          description: `SQL schema created from ${selectedFile.name}`,
        });
      }, 1500);

    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to process Excel file. Please try again.",
        variant: "destructive",
      });
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto p-8">
      <div className="text-center mb-6">
        <FileSpreadsheet className="mx-auto h-12 w-12 text-primary mb-4" />
        <h2 className="text-2xl font-bold mb-2">Upload Excel File</h2>
        <p className="text-muted-foreground">
          Convert your Excel sheets to SQL CREATE TABLE statements
        </p>
      </div>

      {!selectedFile ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200 ${
            isDragActive
              ? 'border-upload-border bg-upload-hover'
              : 'border-upload-border bg-upload-bg hover:bg-upload-hover'
          } ${isProcessing ? 'cursor-not-allowed opacity-50' : ''}`}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-8 w-8 text-primary mb-4" />
          {isDragActive ? (
            <p className="text-lg">Drop your Excel file here...</p>
          ) : (
            <div>
              <p className="text-lg mb-2">
                Drag & drop an Excel file here, or click to select
              </p>
              <p className="text-sm text-muted-foreground">
                Supports .xlsx and .xls files
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
            <div className="flex items-center space-x-3">
              <FileSpreadsheet className="h-6 w-6 text-primary" />
              <div>
                <p className="font-medium">{selectedFile.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={removeFile}
              disabled={isProcessing}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <Button
            onClick={handleUpload}
            className="w-full"
            disabled={isProcessing}
          >
            {isProcessing ? 'Processing...' : 'Generate SQL Schema'}
          </Button>
        </div>
      )}
    </Card>
  );
}