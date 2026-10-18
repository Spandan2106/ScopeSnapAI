import React from 'react';
import { FileText, Printer, Download, Sparkles, RotateCcw } from 'lucide-react';
import { ScopeProposal } from '../types.ts';

interface HeaderProps {
  proposal: ScopeProposal | null;
  onReset: () => void;
  onPrint: () => void;
  onDownloadMarkdown: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  proposal,
  onReset,
  onPrint,
  onDownloadMarkdown,
}) => {
  return (
    <header className="no-print bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-700 flex items-center justify-center text-white shadow-sm shadow-indigo-200">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-lg tracking-tight">ScopeSnap AI</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                Agency & Freelancer Scope Studio
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              Turn messy client briefs into clear scopes, anti-creep exclusions & client proposals
            </p>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {proposal && (
            <>
              <button
                onClick={onPrint}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-2xs"
                title="Print or Save as PDF"
              >
                <Printer className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">Print / PDF</span>
              </button>

              <button
                onClick={onDownloadMarkdown}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-2xs"
                title="Download full proposal as Markdown"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">Export .md</span>
              </button>

              <button
                onClick={onReset}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                title="Start a new proposal"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">New Brief</span>
              </button>
            </>
          )}

          {!proposal && (
            <div className="flex items-center gap-1 text-xs text-slate-500 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200/60">
              <Sparkles className="w-3 h-3 text-indigo-500" />
              <span>INR ₹ Default • Zero Price Guessing</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
