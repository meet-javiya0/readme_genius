
"use client";

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { AppHeader } from '@/components/layout/app-header';
import { MarkdownEditorPanel } from '@/components/readme-genius/markdown-editor-panel';
import { MarkdownToolbar } from '@/components/readme-genius/markdown-toolbar';
import { PreviewPanel } from '@/components/readme-genius/preview-panel';
import { ExportPanel } from '@/components/readme-genius/export-panel';

const DEFAULT_RAW_MARKDOWN = `# Project Title

A brief description of what this project does and who it's for.

## 🚀 Features

- Feature A: Brief description
- Feature B: Brief description
- Feature C: Brief description

## 🛠️ Installation

\`\`\`bash
npm install your-package
# or
yarn add your-package
\`\`\`

## ▶️ Usage

To start the development server:
\`\`\`bash
npm run dev
# or
yarn dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📄 License

This project is licensed under the MIT License - see the LICENSE.md file for details.
`;

export default function ReadmeGeniusPage() {
  const [rawMarkdownContent, setRawMarkdownContent] = useState<string>(DEFAULT_RAW_MARKDOWN);
  const [initialMarkdownContent, setInitialMarkdownContent] = useState<string>(DEFAULT_RAW_MARKDOWN);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [exportFileNameBase, setExportFileNameBase] = useState<string>('README_Template');
  const editorTextareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasUnsavedChanges = rawMarkdownContent !== initialMarkdownContent;

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        event.preventDefault();
        // современных браузеры игнорируют это сообщение и показывают стандартное
        event.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  const handleFileUploaded = (fileName: string, fileContent: string) => {
    setUploadedFileName(fileName);
    setRawMarkdownContent(fileContent);
    setInitialMarkdownContent(fileContent); // Set initial content to uploaded file content
    setExportFileNameBase(fileName.replace(/\.md$/i, '') || 'README_Generated');
  };

  const handleRawMarkdownChange = (newContent: string) => {
    setRawMarkdownContent(newContent);
  };

  const handleUploadAnother = () => {
    setUploadedFileName(null);
    setRawMarkdownContent(DEFAULT_RAW_MARKDOWN);
    setInitialMarkdownContent(DEFAULT_RAW_MARKDOWN); // Reset initial content to default
    setExportFileNameBase('README_Template');
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Reset file input
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && (file.type === 'text/markdown' || file.name.endsWith('.md') || file.name.endsWith('.MD'))) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        handleFileUploaded(file.name, content);
      };
      reader.readAsText(file);
    } else if (file) {
      // TODO: Show an error toast for invalid file type
      alert('Please upload a valid Markdown (.md) file.');
    }
  };

  const handleMarkdownDownloaded = () => {
    setInitialMarkdownContent(rawMarkdownContent); // Mark current content as "saved"
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppHeader 
        onUploadClick={handleUploadClick}
        uploadedFileName={uploadedFileName}
        onUploadAnother={handleUploadAnother}
      />
      <main className="flex-grow container mx-auto p-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Toolbar & Editor */}
        <div className="flex flex-col space-y-4">
          <MarkdownToolbar
            rawMarkdownContent={rawMarkdownContent}
            onMarkdownChange={handleRawMarkdownChange}
            editorTextareaRef={editorTextareaRef}
          />
          <div className="flex-grow rounded-lg border shadow-inner">
            <MarkdownEditorPanel
              markdown={rawMarkdownContent}
              onMarkdownChange={handleRawMarkdownChange}
              textareaRef={editorTextareaRef}
            />
          </div>
        </div>

        {/* Right Column: Preview & Export */}
        <div className="flex flex-col space-y-4">
          <div className="flex-grow rounded-lg border">
             <PreviewPanel markdownContent={rawMarkdownContent} />
          </div>
          <ExportPanel 
            getMarkdownContent={() => rawMarkdownContent} 
            fileName={exportFileNameBase} 
            onMarkdownDownloaded={handleMarkdownDownloaded}
          />
        </div>
      </main>
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        accept=".md,.MD,text/markdown" 
        id="markdown-file-upload"
      />
    </div>
  );
}
