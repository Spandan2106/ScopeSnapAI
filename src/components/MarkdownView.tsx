import React from 'react';

interface MarkdownViewProps {
  content: string;
  className?: string;
}

export const MarkdownView: React.FC<MarkdownViewProps> = ({ content, className = '' }) => {
  // Helper to format inline markdown (bold, italic, code, links)
  const formatInlineText = (text: string): React.ReactNode => {
    const parts: React.ReactNode[] = [];
    let remaining = text;
    let keyIdx = 0;

    while (remaining.length > 0) {
      // Bold **text**
      const boldMatch = remaining.match(/^([\s\S]*?)\*\*(.*?)\*\*([\s\S]*)$/);
      // Code `code`
      const codeMatch = remaining.match(/^([\s\S]*?)`([^`]+)`([\s\S]*)$/);
      // Italic *text* or _text_
      const italicMatch = remaining.match(/^([\s\S]*?)\*([^*]+)\*([\s\S]*)$/);

      if (boldMatch && (!codeMatch || boldMatch[1].length <= codeMatch[1].length)) {
        if (boldMatch[1]) {
          parts.push(<span key={keyIdx++}>{boldMatch[1]}</span>);
        }
        parts.push(
          <strong key={keyIdx++} className="font-semibold text-slate-900">
            {boldMatch[2]}
          </strong>
        );
        remaining = boldMatch[3];
        continue;
      }

      if (codeMatch) {
        if (codeMatch[1]) {
          parts.push(<span key={keyIdx++}>{codeMatch[1]}</span>);
        }
        parts.push(
          <code
            key={keyIdx++}
            className="px-1.5 py-0.5 bg-slate-100 text-indigo-700 rounded text-xs font-mono border border-slate-200"
          >
            {codeMatch[2]}
          </code>
        );
        remaining = codeMatch[3];
        continue;
      }

      if (italicMatch) {
        if (italicMatch[1]) {
          parts.push(<span key={keyIdx++}>{italicMatch[1]}</span>);
        }
        parts.push(
          <em key={keyIdx++} className="italic text-slate-700">
            {italicMatch[2]}
          </em>
        );
        remaining = italicMatch[3];
        continue;
      }

      parts.push(<span key={keyIdx++}>{remaining}</span>);
      break;
    }

    return parts;
  };

  // Group markdown lines into blocks (paragraphs, lists, tables, headers, blockquotes)
  const lines = content.split('\n');
  const blocks: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // Empty line
    if (!trimmed) {
      blocks.push(<div key={`spacer-${i}`} className="h-2" />);
      i++;
      continue;
    }

    // Horizontal Rule
    if (trimmed === '---' || trimmed === '***' || trimmed === '___') {
      blocks.push(<hr key={`hr-${i}`} className="my-6 border-slate-200" />);
      i++;
      continue;
    }

    // Headers
    if (line.startsWith('# ')) {
      blocks.push(
        <h1 key={`h1-${i}`} className="text-2xl font-bold text-slate-900 mt-8 mb-4 border-b border-slate-200 pb-2">
          {formatInlineText(line.slice(2))}
        </h1>
      );
      i++;
      continue;
    }
    if (line.startsWith('## ')) {
      blocks.push(
        <h2 key={`h2-${i}`} className="text-xl font-semibold text-slate-800 mt-6 mb-3 flex items-center gap-2">
          <span className="w-1.5 h-5 bg-indigo-600 rounded-full inline-block shrink-0" />
          <span>{formatInlineText(line.slice(3))}</span>
        </h2>
      );
      i++;
      continue;
    }
    if (line.startsWith('### ')) {
      blocks.push(
        <h3 key={`h3-${i}`} className="text-lg font-semibold text-slate-800 mt-5 mb-2">
          {formatInlineText(line.slice(4))}
        </h3>
      );
      i++;
      continue;
    }
    if (line.startsWith('#### ')) {
      blocks.push(
        <h4 key={`h4-${i}`} className="text-base font-medium text-slate-800 mt-4 mb-2">
          {formatInlineText(line.slice(5))}
        </h4>
      );
      i++;
      continue;
    }

    // Blockquote
    if (line.startsWith('> ')) {
      blocks.push(
        <blockquote
          key={`quote-${i}`}
          className="pl-4 py-2 border-l-4 border-indigo-400 bg-indigo-50/50 text-slate-700 italic my-3 rounded-r"
        >
          {formatInlineText(line.slice(2))}
        </blockquote>
      );
      i++;
      continue;
    }

    // Markdown Table Detection
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      const tableRows: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
        tableRows.push(lines[i].trim());
        i++;
      }

      // Filter out divider lines (|---|---|)
      const validRows = tableRows.filter((r) => {
        const cells = r.split('|').slice(1, -1).map((c) => c.trim());
        return !cells.every((c) => /^[-:]+$/.test(c));
      });

      if (validRows.length > 0) {
        const headerCells = validRows[0].split('|').slice(1, -1).map((c) => c.trim());
        const bodyRows = validRows.slice(1);

        blocks.push(
          <div key={`table-${i}`} className="my-4 overflow-x-auto rounded-xl border border-slate-200 shadow-2xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100/80 text-slate-800 font-semibold border-b border-slate-200">
                <tr>
                  {headerCells.map((cell, cIdx) => (
                    <th key={cIdx} className="py-2.5 px-3 font-semibold">
                      {formatInlineText(cell)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {bodyRows.map((r, rIdx) => {
                  const cells = r.split('|').slice(1, -1).map((c) => c.trim());
                  return (
                    <tr key={rIdx} className="hover:bg-slate-50/60 transition-colors">
                      {cells.map((cell, cIdx) => (
                        <td key={cIdx} className="py-2 px-3 text-slate-700">
                          {formatInlineText(cell)}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
      }
      continue;
    }

    // Unordered List Grouping
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const listItems: string[] = [];
      while (
        i < lines.length &&
        (lines[i].trim().startsWith('- ') || lines[i].trim().startsWith('* '))
      ) {
        listItems.push(lines[i].trim().slice(2));
        i++;
      }
      blocks.push(
        <ul key={`ul-${i}`} className="my-2 ml-5 list-disc space-y-1 text-slate-700">
          {listItems.map((item, lIdx) => (
            <li key={lIdx} className="leading-relaxed">
              {formatInlineText(item)}
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // Ordered List Grouping
    const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
    if (numMatch) {
      const listItems: string[] = [];
      while (i < lines.length && lines[i].trim().match(/^(\d+)\.\s+(.*)$/)) {
        const m = lines[i].trim().match(/^(\d+)\.\s+(.*)$/);
        if (m) listItems.push(m[2]);
        i++;
      }
      blocks.push(
        <ol key={`ol-${i}`} className="my-2 ml-5 list-decimal space-y-1 text-slate-700">
          {listItems.map((item, lIdx) => (
            <li key={lIdx} className="leading-relaxed">
              {formatInlineText(item)}
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // Regular Paragraph
    // We use <div className="text-slate-700 my-2 leading-relaxed"> so that block hydration warnings can never occur
    blocks.push(
      <div key={`p-${i}`} className="text-slate-700 my-2 leading-relaxed text-sm">
        {formatInlineText(line)}
      </div>
    );
    i++;
  }

  return (
    <div className={`prose max-w-none text-slate-800 font-normal leading-relaxed ${className}`}>
      {blocks}
    </div>
  );
};
