import { FileSpreadsheet, Database } from 'lucide-react';

export function Header() {
  return (
    <header className="w-full border-b border-border bg-card/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 text-primary">
            <FileSpreadsheet className="h-8 w-8" />
            <Database className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Excel to SQL Schema Wizard
            </h1>
            <p className="text-sm text-muted-foreground">
              Convert Excel spreadsheets to SQL CREATE TABLE statements
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}