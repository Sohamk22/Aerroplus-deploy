'use client';

import React from 'react';

interface FormattedMessageProps {
  content: string;
  className?: string;
}

/**
 * Strips raw markdown clutter and renders rich, clean text with
 * proper <strong> tags, styled bullet lists, clean headers, and no leftover asterisks.
 */
export const FormattedMessage: React.FC<FormattedMessageProps> = ({ content, className = '' }) => {
  if (!content) return null;

  // Split into lines to process headers, lists, and paragraphs
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];

  let currentList: string[] = [];
  let isNumberedList = false;

  const flushList = () => {
    if (currentList.length === 0) return;
    const listItems = currentList.map((item, idx) => (
      <li key={idx} className="flex items-start gap-2">
        {isNumberedList ? (
          <span className="text-[11px] font-bold text-brand-700 mt-0.5 shrink-0">
            {idx + 1}.
          </span>
        ) : (
          <span className="w-1.5 h-1.5 rounded-full bg-brand-600 mt-1.5 shrink-0" />
        )}
        <span className="flex-1">{renderInline(item)}</span>
      </li>
    ));

    elements.push(
      <ul key={`list-${elements.length}`} className="space-y-1.5 my-2 pl-0.5">
        {listItems}
      </ul>
    );
    currentList = [];
    isNumberedList = false;
  };

  // Helper to render inline bolding and clean up unwanted asterisks
  const renderInline = (text: string): React.ReactNode => {
    // Clean unwanted star symbols like lone '*' or unclosed '**'
    // Regex matches **bold text**
    const parts: React.ReactNode[] = [];
    const regex = /\*\*(.*?)\*\*/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        // Text before match: remove any stray asterisks
        const cleanPre = text.slice(lastIndex, match.index).replace(/\*/g, '');
        if (cleanPre) parts.push(cleanPre);
      }
      // Bold match
      parts.push(
        <strong key={`b-${lastIndex}`} className="font-bold text-slate-900">
          {match[1].replace(/\*/g, '')}
        </strong>
      );
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      const cleanPost = text.slice(lastIndex).replace(/\*/g, '');
      if (cleanPost) parts.push(cleanPost);
    }

    return parts.length > 0 ? parts : text.replace(/\*/g, '');
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i].trim();

    if (!rawLine) {
      flushList();
      continue;
    }

    // Check for headers (e.g. ### Header or ## Header)
    if (rawLine.startsWith('#')) {
      flushList();
      const headerText = rawLine.replace(/^#+\s*/, '').replace(/\*/g, '');
      elements.push(
        <h5
          key={`h-${elements.length}`}
          className="font-bold text-slate-900 text-xs sm:text-sm mt-3 mb-1 text-brand-950 flex items-center gap-1.5"
        >
          {headerText}
        </h5>
      );
      continue;
    }

    // Check for numbered list (e.g. "1. ", "2. ")
    const numMatch = rawLine.match(/^(\d+)\.\s+(.*)/);
    if (numMatch) {
      if (currentList.length > 0 && !isNumberedList) {
        flushList();
      }
      isNumberedList = true;
      currentList.push(numMatch[2]);
      continue;
    }

    // Check for bullet list (e.g. "• ", "- ", "* ")
    const bulletMatch = rawLine.match(/^[•\-\*]\s+(.*)/);
    if (bulletMatch) {
      if (currentList.length > 0 && isNumberedList) {
        flushList();
      }
      isNumberedList = false;
      currentList.push(bulletMatch[1]);
      continue;
    }

    // Normal paragraph line
    flushList();
    elements.push(
      <p key={`p-${elements.length}`} className="leading-relaxed">
        {renderInline(rawLine)}
      </p>
    );
  }

  flushList();

  return <div className={`space-y-2 ${className}`}>{elements}</div>;
};

/**
 * Clean inline string renderer that parses **bold** into <strong> and strips stray asterisks
 */
export const CleanInline: React.FC<{ text: string; className?: string }> = ({ text, className = '' }) => {
  if (!text) return null;

  const parts: React.ReactNode[] = [];
  const regex = /\*\*(.*?)\*\*/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      const cleanPre = text.slice(lastIndex, match.index).replace(/\*/g, '');
      if (cleanPre) parts.push(cleanPre);
    }
    parts.push(
      <strong key={`b-${lastIndex}`} className="font-semibold text-inherit">
        {match[1].replace(/\*/g, '')}
      </strong>
    );
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    const cleanPost = text.slice(lastIndex).replace(/\*/g, '');
    if (cleanPost) parts.push(cleanPost);
  }

  return <span className={className}>{parts.length > 0 ? parts : text.replace(/\*/g, '')}</span>;
};
