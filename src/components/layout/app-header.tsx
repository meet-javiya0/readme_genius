
"use client";

import { Button } from '@/components/ui/button';
import { FileText, UploadCloud, FileUp } from 'lucide-react';

interface AppHeaderProps {
  onUploadClick: () => void;
  uploadedFileName: string | null;
  onUploadAnother: () => void;
}

export function AppHeader({ onUploadClick, uploadedFileName, onUploadAnother }: AppHeaderProps) {
  return (
    <header className="bg-card border-b p-4 shadow-sm">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">ReadmeGenius</h1>
        </div>
        <div>
          {uploadedFileName ? (
            <div className="flex items-center gap-2">
              <p className="text-sm text-muted-foreground">
                File: <span className="font-semibold text-foreground">{uploadedFileName}</span>
              </p>
              <Button onClick={onUploadAnother} variant="outline" size="sm">
                <FileUp className="mr-2 h-4 w-4" /> Upload Different
              </Button>
            </div>
          ) : (
            <Button onClick={onUploadClick} variant="outline">
              <UploadCloud className="mr-2 h-5 w-5" /> Upload README
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
