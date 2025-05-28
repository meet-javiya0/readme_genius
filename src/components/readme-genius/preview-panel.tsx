
"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// ScrollArea import removed as it's no longer used here
import { Eye } from 'lucide-react';

interface PreviewPanelProps {
  markdownContent: string;
}

const escapeHtml = (unsafe: string): string => {
  if (typeof unsafe !== 'string') {
    return '';
  }
  return unsafe
       .replace(/&/g, "&amp;")
       .replace(/</g, "&lt;")
       .replace(/>/g, "&gt;")
       .replace(/"/g, "&quot;")
       .replace(/'/g, "&#039;");
};

export function PreviewPanel({ markdownContent }: PreviewPanelProps) {
  const renderMarkdownAsHtml = (md: string) => {
    let html = md;

    // Process block elements first

    // Code blocks (```lang\ncode\n```)
    html = html.replace(/```(\w*\n)?([\s\S]*?)\n```\s*/gm, (match, langLine, code) => {
      const lang = langLine ? langLine.trim() : 'plaintext';
      const escapedCode = escapeHtml(code.trim());
      return `<div class="code-block-wrapper my-4 rounded-md bg-muted"><pre class="p-4 overflow-x-auto"><code class="language-${lang}">${escapedCode}</code></pre></div>\n`;
    });
    
    // Headers (e.g., # Header) - ensure they are at the start of a line
    html = html.replace(/^###### (.*$)/gm, (match, content) => `<h6 class="text-sm font-semibold mt-2 mb-1">${escapeHtml(content.trim())}</h6>`);
    html = html.replace(/^##### (.*$)/gm, (match, content) => `<h5 class="text-base font-semibold mt-2 mb-1">${escapeHtml(content.trim())}</h5>`);
    html = html.replace(/^#### (.*$)/gm, (match, content) => `<h4 class="text-lg font-semibold mt-3 mb-1">${escapeHtml(content.trim())}</h4>`);
    html = html.replace(/^### (.*$)/gm, (match, content) => `<h3 class="text-xl font-semibold mt-4 mb-2">${escapeHtml(content.trim())}</h3>`);
    html = html.replace(/^## (.*$)/gm, (match, content) => `<h2 class="text-2xl font-semibold my-3 border-b pb-1">${escapeHtml(content.trim())}</h2>`);
    html = html.replace(/^# (.*$)/gm, (match, content) => `<h1 class="text-3xl font-bold my-4 border-b pb-2">${escapeHtml(content.trim())}</h1>`);
    
    // Horizontal Rules
    html = html.replace(/^\s*(?:---|\*\*\*|___)\s*$/gm, () => '<hr class="my-6 border-border" />\n');

    // Blockquotes - handle multiline correctly
    html = html.replace(/^(?:> .*(?:\n|$))+/gm, (match) => {
      const lines = match.split('\n').map(line => escapeHtml(line.replace(/^>\s?/, '').trim())).filter(line => line);
      const innerContent = lines.join('<br />'); 
      return `<blockquote class="my-4 border-l-4 border-primary pl-4 italic text-muted-foreground"><p>${innerContent}</p></blockquote>\n`;
    });
    
    // Unordered lists
    html = html.replace(/^(?:[\s]*[-*+] +(.*)(?:\n|$))+/gm, (match) => {
        const items = match.trim().split('\n').map(line => {
            let itemContent = line.replace(/^\s*[-*+] +/, '').trim();
            itemContent = itemContent.replace(/!\[(.*?)\]\((.*?)\)/g, (_m, alt, url) => `<img src="${escapeHtml(url)}" alt="${escapeHtml(alt)}" style="max-width:100%;border-radius:0.25rem;margin-top:0.5rem;margin-bottom:0.5rem;" data-ai-hint="illustration diagram" />`);
            itemContent = itemContent.replace(/\[(.*?)\]\((.*?)\)/g, (_m, text, url) => `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">${escapeHtml(text)}</a>`);
            itemContent = itemContent.replace(/\*\*(.*?)\*\*|__(.*?)__/g, (_m, c1, c2) => `<strong>${escapeHtml(c1 || c2)}</strong>`);
            itemContent = itemContent.replace(/\*(.*?)\*|_(.*?)_/g, (_m, c1, c2) => `<em>${escapeHtml(c1 || c2)}</em>`);
            itemContent = itemContent.replace(/`([^`]+?)`/g, (_m, c) => `<code class="px-1 py-0.5 bg-muted text-sm rounded">${escapeHtml(c)}</code>`);
            itemContent = itemContent.replace(/~~(.*?)~~/g, (_m, c) => `<del>${escapeHtml(c)}</del>`);
            return `<li class="my-1">${itemContent}</li>`;
        }).join('');
        return `<ul class="list-disc pl-6 my-4">${items}</ul>\n`;
    });

    // Ordered lists
    html = html.replace(/^(?:\s*\d+\. +(.*)(?:\n|$))+/gm, (match) => {
        const items = match.trim().split('\n').map(line => {
            let itemContent = line.replace(/^\s*\d+\. +/, '').trim();
            itemContent = itemContent.replace(/!\[(.*?)\]\((.*?)\)/g, (_m, alt, url) => `<img src="${escapeHtml(url)}" alt="${escapeHtml(alt)}" style="max-width:100%;border-radius:0.25rem;margin-top:0.5rem;margin-bottom:0.5rem;" data-ai-hint="illustration diagram" />`);
            itemContent = itemContent.replace(/\[(.*?)\]\((.*?)\)/g, (_m, text, url) => `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">${escapeHtml(text)}</a>`);
            itemContent = itemContent.replace(/\*\*(.*?)\*\*|__(.*?)__/g, (_m, c1, c2) => `<strong>${escapeHtml(c1 || c2)}</strong>`);
            itemContent = itemContent.replace(/\*(.*?)\*|_(.*?)_/g, (_m, c1, c2) => `<em>${escapeHtml(c1 || c2)}</em>`);
            itemContent = itemContent.replace(/`([^`]+?)`/g, (_m, c) => `<code class="px-1 py-0.5 bg-muted text-sm rounded">${escapeHtml(c)}</code>`);
            itemContent = itemContent.replace(/~~(.*?)~~/g, (_m, c) => `<del>${escapeHtml(c)}</del>`);
            return `<li class="my-1">${itemContent}</li>`;
        }).join('');
        return `<ol class="list-decimal pl-6 my-4">${items}</ol>\n`;
    });

    const paragraphs = html.split(/\n\s*\n/).map(paragraph => {
      const trimmedParagraph = paragraph.trim();
      if (!trimmedParagraph) return "";
      
      const isAlreadyBlock = /^(?:<(?:h[1-6]|ul|ol|li|pre|blockquote|hr|div)(?:[\s>][\s\S]*)?>[\s\S]*<\/(?:h[1-6]|ul|ol|li|pre|blockquote|hr|div)>|<img[\s\S]*>)$/i.test(trimmedParagraph);
      if (isAlreadyBlock) {
          return trimmedParagraph; 
      }

      let processedParagraph = trimmedParagraph;
      processedParagraph = processedParagraph.replace(/!\[(.*?)\]\((.*?)\)/g, (match, alt, url) => `<img src="${escapeHtml(url)}" alt="${escapeHtml(alt)}" class="my-4 rounded-md shadow-sm max-w-full" data-ai-hint="illustration diagram" />`);
      processedParagraph = processedParagraph.replace(/\[(.*?)\]\((.*?)\)/g, (match, text, url) => `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">${escapeHtml(text)}</a>`);
      processedParagraph = processedParagraph.replace(/\*\*(.*?)\*\*|__(.*?)__/g, (match, c1, c2) => `<strong>${escapeHtml(c1 || c2)}</strong>`);
      processedParagraph = processedParagraph.replace(/\*(.*?)\*|_(.*?)_/g, (match, c1, c2) => `<em>${escapeHtml(c1 || c2)}</em>`);
      processedParagraph = processedParagraph.replace(/`([^`]+?)`/g, (match, content) => `<code class="px-1 py-0.5 bg-muted text-sm rounded">${escapeHtml(content)}</code>`);
      processedParagraph = processedParagraph.replace(/~~(.*?)~~/g, (match, content) => `<del>${escapeHtml(content)}</del>`);
      processedParagraph = processedParagraph.replace(/\n/g, ' '); 

      return `<p class="my-4 leading-relaxed">${processedParagraph}</p>`;
    }).filter(p => p !== "").join('\n');
    
    html = paragraphs;
    
    return html;
  };

  return (
    <Card className="flex flex-col shadow-none border-0 rounded-none"> {/* Removed h-full */}
      <CardHeader className="bg-muted/30 p-3 border-b">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Eye className="h-5 w-5 text-primary" />
          Live Preview
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow p-0"> {/* Removed overflow-hidden */}
          {/* ScrollArea removed */}
          <div 
            className="prose dark:prose-invert prose-sm sm:prose-base lg:prose-lg max-w-none p-6"
            style={{ 
              fontFamily: 'var(--font-geist-sans)', 
              minHeight: '200px', 
             }}
            dangerouslySetInnerHTML={{ __html: renderMarkdownAsHtml(markdownContent) }}
          />
      </CardContent>
    </Card>
  );
}
