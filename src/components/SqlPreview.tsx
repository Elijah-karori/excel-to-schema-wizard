import { useState } from 'react';
import { Copy, Download, Code2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface SqlPreviewProps {
  sqlSchema: string;
  fileName: string;
}

export function SqlPreview({ sqlSchema, fileName }: SqlPreviewProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(sqlSchema);
      setCopied(true);
      toast({
        title: "Copied to clipboard",
        description: "SQL schema has been copied to your clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const downloadSql = () => {
    const blob = new Blob([sqlSchema], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName.split('.')[0]}_schema.sql`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Download started",
      description: "SQL schema file is being downloaded",
    });
  };

  const tableCount = (sqlSchema.match(/CREATE TABLE/g) || []).length;

  return (
    <Card className="w-full max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Code2 className="h-6 w-6 text-primary" />
          <div>
            <h3 className="text-lg font-semibold">Generated SQL Schema</h3>
            <p className="text-sm text-muted-foreground">
              From: {fileName}
            </p>
          </div>
        </div>
        <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
          {tableCount} {tableCount === 1 ? 'Table' : 'Tables'}
        </Badge>
      </div>

      <div className="bg-code-bg border border-code-border rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-code-border bg-secondary/50">
          <span className="text-sm font-medium text-muted-foreground">schema.sql</span>
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={copyToClipboard}
              className="h-8 px-3"
            >
              {copied ? (
                <Check className="h-4 w-4 text-success" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              {copied ? 'Copied' : 'Copy'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={downloadSql}
              className="h-8 px-3"
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
          </div>
        </div>
        
        <pre className="p-4 text-sm text-foreground overflow-x-auto max-h-96 overflow-y-auto">
          <code className="language-sql">{sqlSchema}</code>
        </pre>
      </div>

      <div className="mt-4 p-4 bg-muted/50 rounded-lg">
        <h4 className="font-medium mb-2 text-sm">Schema Details:</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• {tableCount} table{tableCount !== 1 ? 's' : ''} generated</li>
          <li>• Column types automatically inferred from Excel data</li>
          <li>• Primary keys and constraints included where applicable</li>
          <li>• Ready to execute in your SQL database</li>
        </ul>
      </div>
    </Card>
  );
}