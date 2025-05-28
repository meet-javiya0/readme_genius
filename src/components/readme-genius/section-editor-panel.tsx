"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileText, FileCode } from 'lucide-react';

interface ExportPanelProps {
  getMarkdownContent: () => string;
  fileName?: string;
}

export function ExportPanel({ getMarkdownContent, fileName = 'README' }: ExportPanelProps) {
  const downloadFile = (content: string, downloadFileName: string, contentType: string) => {
    const blob = new Blob([content], { type: contentType });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = downloadFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  const handleExportMarkdown = () => {
    const markdown = getMarkdownContent();
    const finalFileName = fileName.endsWith('.md') ? fileName : `${fileName}.md`;
    downloadFile(markdown, finalFileName, 'text/markdown;charset=utf-8;');
  };

  const handleExportHtml = () => {
    const markdown = getMarkdownContent();
    // Basic Markdown to HTML for export.
    // This is a simplified parser. For full fidelity, a library like 'marked' or 'showdown' is recommended.
    let htmlContent = markdown
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

    // Headers
    htmlContent = htmlContent.replace(/^###### (.*$)/gim, '<h6>$1</h6>');
    htmlContent = htmlContent.replace(/^##### (.*$)/gim, '<h5>$1</h5>');
    htmlContent = htmlContent.replace(/^#### (.*$)/gim, '<h4>$1</h4>');
    htmlContent = htmlContent.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    htmlContent = htmlContent.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    htmlContent = htmlContent.replace(/^# (.*$)/gim, '<h1>$1</h1>');

    // Bold and Italic
    htmlContent = htmlContent.replace(/\*\*(.*?)\*\*|__(.*?)__/gim, '<strong>$1$2</strong>');
    htmlContent = htmlContent.replace(/\*(.*?)\*|_(.*?)_/gim, '<em>$1$2</em>');
    
    // Strikethrough
    htmlContent = htmlContent.replace(/~~(.*?)~~/gim, '<del>$1</del>');

    // Links and Images
    htmlContent = htmlContent.replace(/!\[(.*?)\]\((.*?)\)/gim, '<img src="$2" alt="$1" style="max-width:100%;" />');
    htmlContent = htmlContent.replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    
    // Code blocks ```lang\ncode\n```
    htmlContent = htmlContent.replace(/```(\w*)\n([\s\S]*?)\n```/gm, (match, lang, code) => {
        return `<pre><code class="language-${lang || 'plaintext'}">${code.trim()}</code></pre>`;
    });
    // Inline code `code`
    htmlContent = htmlContent.replace(/`([^`]+?)`/gim, '<code>$1</code>');

    // Lists (simplified - does not handle nested lists well)
    htmlContent = htmlContent.replace(/^\s*[-*+]\s+(.*)/gim, '<ul>\n  <li>$1</li>\n</ul>'); // Group later
    htmlContent = htmlContent.replace(/^\s*\d+\.\s+(.*)/gim, '<ol>\n  <li>$1</li>\n</ol>'); // Group later
    // Consolidate adjacent list items
    htmlContent = htmlContent.replace(/<\/ul>\n<ul>/gim, '');
    htmlContent = htmlContent.replace(/<\/ol>\n<ol>/gim, '');

    // Blockquotes
    htmlContent = htmlContent.replace(/^>\s*(.*)/gim, '<blockquote><p>$1</p></blockquote>');
    htmlContent = htmlContent.replace(/<\/blockquote>\n<blockquote>/gim, '\n');


    // Paragraphs (remaining lines) - This is very basic
    htmlContent = htmlContent.split('\n\n').map(paragraph => {
      if (paragraph.match(/<\/?(h[1-6]|ul|ol|li|pre|blockquote|del|strong|em|code|a|img)/i)) {
        return paragraph; // Don't wrap already processed HTML or lines with HTML
      }
      return paragraph.trim() ? `<p>${paragraph.replace(/\n/g, '<br />')}</p>` : '';
    }).join('\n');


    const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${fileName}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"; line-height: 1.6; padding: 20px; margin: 0 auto; max-width: 800px; color: #333; }
    h1, h2, h3, h4, h5, h6 { margin-top: 1.5em; margin-bottom: 0.5em; line-height: 1.2; }
    h1 { font-size: 2em; } h2 { font-size: 1.5em; } h3 { font-size: 1.2em; }
    code { background-color: #f0f0f0; padding: 0.2em 0.4em; border-radius: 3px; font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace; font-size: 0.9em; }
    pre { background-color: #f0f0f0; padding: 1em; border-radius: 5px; overflow-x: auto; margin: 1em 0; }
    pre code { background-color: transparent; padding: 0; font-size: 0.9em; }
    a { color: #0366d6; text-decoration: none; }
    a:hover { text-decoration: underline; }
    img { max-width: 100%; height: auto; border-radius: 5px; margin: 10px 0; }
    ul, ol { margin: 1em 0; padding-left: 2em; }
    li { margin-bottom: 0.5em; }
    blockquote { border-left: 4px solid #ddd; padding-left: 1em; margin: 1em 0; color: #666; }
    p { margin: 1em 0; }
    del { text-decoration: line-through; }
  </style>
</head>
<body>
  ${htmlContent}
</body>
</html>`;
    const finalFileName = (fileName.endsWith('.md') ? fileName.slice(0, -3) : fileName) + '.html';
    downloadFile(fullHtml, finalFileName, 'text/html;charset=utf-8;');
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="p-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Download className="h-5 w-5 text-primary" />
          Export Options
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-3 md:space-y-0 md:flex md:space-x-3">
        <Button onClick={handleExportMarkdown} className="w-full md:w-auto">
          <FileText className="mr-2 h-5 w-5" /> Export as Markdown
        </Button>
        <Button onClick={handleExportHtml} variant="secondary" className="w-full md:w-auto">
          <FileCode className="mr-2 h-5 w-5" /> Export as HTML
        </Button>
      </CardContent>
    </Card>
  );
}