
"use client";

import React from 'react';
import { Textarea } from '@/components/ui/textarea';

interface MarkdownEditorPanelProps {
  markdown: string;
  onMarkdownChange: (newMarkdown: string) => void;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
}

export function MarkdownEditorPanel({ markdown, onMarkdownChange, textareaRef }: MarkdownEditorPanelProps) {
  return (
    <Textarea
      ref={textareaRef}
      value={markdown}
      onChange={(e) => onMarkdownChange(e.target.value)}
      placeholder="Start typing your README content here..."
      className="w-full p-4 border-0 rounded-none focus-visible:ring-0 resize-none text-base font-mono"
      aria-label="Markdown Content Editor"
      rows={40} // Set a large default number of rows to make it tall
    />
  );
}
