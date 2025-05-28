
"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Bold, Italic, Heading1, Heading2, Heading3, List, Code2, LinkIcon, Image as ImageIcon, Pilcrow, Quote
} from 'lucide-react';

interface MarkdownToolbarProps {
  rawMarkdownContent: string;
  onMarkdownChange: (newContent: string) => void;
  editorTextareaRef: React.RefObject<HTMLTextAreaElement>;
}

type FormatType = 
  | 'bold' | 'italic' 
  | 'h1' | 'h2' | 'h3' 
  | 'ul' | 'ol' | 'codeblock' | 'inlinecode'
  | 'link' | 'image' | 'blockquote' | 'paragraph';

interface ToolbarButton {
  label: string;
  icon: React.ElementType;
  formatType: FormatType;
  prefix?: string;
  suffix?: string;
  block?: boolean; // True if it's a block-level element or needs special handling
  multiline?: boolean; // True if the prefix/suffix should wrap multiple lines
}

const TOOLBAR_BUTTONS: ToolbarButton[] = [
  { label: 'Bold', icon: Bold, formatType: 'bold', prefix: '**', suffix: '**' },
  { label: 'Italic', icon: Italic, formatType: 'italic', prefix: '*', suffix: '*' },
  { label: 'Heading 1', icon: Heading1, formatType: 'h1', prefix: '# ', block: true },
  { label: 'Heading 2', icon: Heading2, formatType: 'h2', prefix: '## ', block: true },
  { label: 'Heading 3', icon: Heading3, formatType: 'h3', prefix: '### ', block: true },
  { label: 'Paragraph', icon: Pilcrow, formatType: 'paragraph', prefix: '', block: true }, // For ensuring a line is paragraph
  { label: 'Blockquote', icon: Quote, formatType: 'blockquote', prefix: '> ', block: true, multiline: true },
  { label: 'Unordered List', icon: List, formatType: 'ul', prefix: '- ', block: true, multiline: true },
  // { label: 'Ordered List', icon: ListOrdered, formatType: 'ol', prefix: '1. ', block: true, multiline: true }, // Add ListOrdered if desired
  { label: 'Code Block', icon: Code2, formatType: 'codeblock', prefix: '```\n', suffix: '\n```', multiline: true },
  { label: 'Inline Code', icon: Code2, formatType: 'inlinecode', prefix: '`', suffix: '`' },
  { label: 'Link', icon: LinkIcon, formatType: 'link' }, // Special handling
  { label: 'Image', icon: ImageIcon, formatType: 'image' }, // Special handling
];

export function MarkdownToolbar({ rawMarkdownContent, onMarkdownChange, editorTextareaRef }: MarkdownToolbarProps) {
  
  const applyFormat = (button: ToolbarButton) => {
    if (!editorTextareaRef.current) return;
    const textarea = editorTextareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = rawMarkdownContent.substring(start, end);

    let prefix = button.prefix || '';
    let suffix = button.suffix || '';
    
    let newContent = '';
    let newCursorPosition = start + prefix.length;

    if (button.formatType === 'link') {
      const url = prompt("Enter link URL:", "https://");
      if (!url) return; // User cancelled
      const linkText = selectedText || "link text";
      const replacement = `[${linkText}](${url})`;
      newContent = rawMarkdownContent.substring(0, start) + replacement + rawMarkdownContent.substring(end);
      newCursorPosition = start + replacement.length;
    } else if (button.formatType === 'image') {
      const imageUrl = prompt("Enter image URL:", "https://placehold.co/300x200.png");
      if (!imageUrl) return; // User cancelled
      const altText = selectedText || "image alt text";
      const replacement = `![${altText}](${imageUrl})`;
      newContent = rawMarkdownContent.substring(0, start) + replacement + rawMarkdownContent.substring(end);
      newCursorPosition = start + replacement.length;
    } else if (button.block) {
      // For block elements, apply prefix to the beginning of the line(s)
      // Find the start of the current line
      let lineStart = start;
      while (lineStart > 0 && rawMarkdownContent[lineStart - 1] !== '\n') {
        lineStart--;
      }
      // If multiline and selection spans multiple lines
      if (button.multiline && selectedText.includes('\n')) {
        const lines = selectedText.split('\n');
        const prefixedLines = lines.map(line => prefix + line).join('\n');
        if (button.formatType === 'codeblock') {
             newContent = rawMarkdownContent.substring(0, start) + prefix + selectedText + suffix + rawMarkdownContent.substring(end);
             newCursorPosition = start + prefix.length + selectedText.length + suffix.length;
        } else {
             newContent = rawMarkdownContent.substring(0, lineStart) + prefixedLines + rawMarkdownContent.substring(end + (prefixedLines.length - selectedText.length - (lines.length -1) * prefix.length));
             newCursorPosition = lineStart + prefixedLines.length;
        }

      } else { // Single line block or simple prefix like headings
        const currentLineContent = rawMarkdownContent.substring(lineStart, end + (rawMarkdownContent.substring(lineStart).indexOf('\n') !== -1 ? rawMarkdownContent.substring(lineStart).indexOf('\n') : rawMarkdownContent.length - lineStart));
        
        if (button.formatType === 'paragraph') { // Special: remove heading/list/quote markers
            let cleanedLine = currentLineContent.replace(/^(#+\s*|>+\s*|[-*+]\s*|\d+\.\s*)/, '');
            newContent = rawMarkdownContent.substring(0, lineStart) + cleanedLine + rawMarkdownContent.substring(lineStart + currentLineContent.length);
            newCursorPosition = lineStart + cleanedLine.length;
        } else if (button.formatType === 'codeblock') {
            newContent = rawMarkdownContent.substring(0, start) + prefix + selectedText + suffix + rawMarkdownContent.substring(end);
            newCursorPosition = start + prefix.length + selectedText.length + suffix.length;
        } else {
            newContent = rawMarkdownContent.substring(0, lineStart) + prefix + rawMarkdownContent.substring(lineStart);
            newCursorPosition = lineStart + prefix.length + (end - lineStart); // Adjust cursor based on original selection relative to line start
        }
      }
    } else { // Inline elements
      newContent = rawMarkdownContent.substring(0, start) + prefix + selectedText + suffix + rawMarkdownContent.substring(end);
      newCursorPosition = start + prefix.length + selectedText.length + suffix.length;
    }

    onMarkdownChange(newContent);

    // Defer focusing and setting selection to allow React to re-render
    setTimeout(() => {
      if (editorTextareaRef.current) {
        editorTextareaRef.current.focus();
        // For block elements that modify whole lines, setting precise selection is tricky
        // For inline, we can select the inserted/modified text
        if (!button.block || button.formatType === 'link' || button.formatType === 'image' || button.formatType === 'codeblock') {
           if(button.formatType === 'link' || button.formatType === 'image' || button.formatType === 'codeblock'){
             editorTextareaRef.current.setSelectionRange(newCursorPosition, newCursorPosition);
           } else {
             editorTextareaRef.current.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length);
           }
        } else {
            editorTextareaRef.current.setSelectionRange(newCursorPosition, newCursorPosition);
        }
      }
    }, 0);
  };

  return (
    <TooltipProvider>
      <div className="bg-card p-2 rounded-lg shadow border flex flex-nowrap overflow-x-auto gap-1 items-center">
        {TOOLBAR_BUTTONS.map((btn) => (
          <Tooltip key={btn.label}>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={() => applyFormat(btn)}
                className="h-8 w-8 flex-shrink-0" // Smaller icons, prevent shrinking
                aria-label={btn.label}
              >
                <btn.icon className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{btn.label}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
}

    