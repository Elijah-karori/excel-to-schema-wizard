import { useState } from 'react';
import { Header } from '@/components/Header';
import { FileUpload } from '@/components/FileUpload';
import { SqlPreview } from '@/components/SqlPreview';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';

const Index = () => {
  const [sqlSchema, setSqlSchema] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileProcessed = (schema: string, name: string) => {
    setIsProcessing(true);
    // Simulate processing time
    setTimeout(() => {
      setSqlSchema(schema);
      setFileName(name);
      setIsProcessing(false);
    }, 1500);
  };

  const handleReset = () => {
    setSqlSchema('');
    setFileName('');
    setIsProcessing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {!sqlSchema ? (
            <div className="flex flex-col items-center space-y-6">
              <div className="text-center max-w-2xl">
                <h2 className="text-3xl font-bold mb-4">
                  Transform Excel to SQL Schema
                </h2>
                <p className="text-lg text-muted-foreground mb-8">
                  Upload your Excel files and instantly generate CREATE TABLE statements 
                  with proper column types and constraints. Perfect for database migration 
                  and schema planning.
                </p>
              </div>
              
              <FileUpload 
                onFileProcessed={handleFileProcessed}
                isProcessing={isProcessing}
              />
              
              {isProcessing && (
                <div className="text-center">
                  <div className="inline-flex items-center space-x-3 text-primary">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                    <span className="text-sm font-medium">
                      Analyzing Excel structure and generating SQL schema...
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Schema Generated Successfully</h2>
                <Button onClick={handleReset} variant="outline">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Upload Another File
                </Button>
              </div>
              
              <SqlPreview sqlSchema={sqlSchema} fileName={fileName} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
