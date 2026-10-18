import React, { useState } from 'react';
import { Header } from './components/Header.tsx';
import { BriefInputPanel } from './components/BriefInputPanel.tsx';
import { ProposalViewer } from './components/ProposalViewer.tsx';
import { EmptyState } from './components/EmptyState.tsx';
import { ProjectBriefInput, ScopeProposal, SampleBrief } from './types.ts';
import { downloadFile } from './utils/clipboard.ts';
import { AlertCircle, X, Sparkles } from 'lucide-react';

const initialInput: ProjectBriefInput = {
  brief: '',
  freelancerName: 'Aarav Mehta',
  businessName: 'PixelCraft Digital',
  clientName: '',
  currency: 'INR',
  tone: 'Consultative & Warm',
  estimatedBudget: '',
  targetTimeline: '',
};

export default function App() {
  const [inputData, setInputData] = useState<ProjectBriefInput>(initialInput);
  const [proposal, setProposal] = useState<ScopeProposal | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRefining, setIsRefining] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleUpdateInput = (updated: Partial<ProjectBriefInput>) => {
    setInputData((prev) => ({ ...prev, ...updated }));
  };

  const handleSelectSample = (sample: SampleBrief) => {
    setInputData({
      brief: sample.brief,
      freelancerName: sample.freelancerName,
      businessName: sample.businessName,
      clientName: sample.clientName,
      currency: sample.currency,
      tone: sample.tone,
      estimatedBudget: sample.estimatedBudget,
      targetTimeline: sample.targetTimeline,
      imageBase64: undefined,
      imageMimeType: undefined,
      imageFileName: undefined,
    });
    setErrorMessage(null);
  };

  const handleGenerate = async () => {
    if (!inputData.brief.trim() && !inputData.imageBase64) {
      setErrorMessage('Please enter a client brief or attach a screenshot.');
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage(null);

      const response = await fetch('/api/analyze-brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inputData),
      });

      if (!response.ok) {
        const errorJson = await response.json().catch(() => ({}));
        throw new Error(errorJson.error || `Server responded with ${response.status}`);
      }

      const proposalResult: ScopeProposal = await response.json();
      setProposal(proposalResult);
    } catch (err: any) {
      console.error('Generation failed:', err);
      setErrorMessage(
        err.message || 'Failed to generate proposal. Please ensure the prompt is clear and try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefineProposal = async (instruction: string) => {
    if (!proposal) return;
    try {
      setIsRefining(true);
      setErrorMessage(null);

      const response = await fetch('/api/refine-proposal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentProposal: proposal,
          instruction,
        }),
      });

      if (!response.ok) {
        const errorJson = await response.json().catch(() => ({}));
        throw new Error(errorJson.error || `Refinement failed (${response.status})`);
      }

      const updatedResult: ScopeProposal = await response.json();
      setProposal(updatedResult);
    } catch (err: any) {
      console.error('Refinement failed:', err);
      setErrorMessage(err.message || 'Failed to refine proposal.');
    } finally {
      setIsRefining(false);
    }
  };

  const handleReset = () => {
    if (confirm('Start a new proposal? Your current edits will be cleared.')) {
      setProposal(null);
      setErrorMessage(null);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadMarkdown = () => {
    if (!proposal) return;
    const filename = `${proposal.projectTitle.toLowerCase().replace(/[^a-z0-9]/g, '-')}-proposal.md`;
    downloadFile(filename, proposal.clientFacingProposalMarkdown);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Top Navigation */}
      <Header
        proposal={proposal}
        onReset={handleReset}
        onPrint={handlePrint}
        onDownloadMarkdown={handleDownloadMarkdown}
      />

      {/* Error Alert Banner */}
      {errorMessage && (
        <div className="no-print max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 w-full">
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm flex items-start justify-between gap-3 shadow-xs">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Notice:</span> {errorMessage}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="text-red-400 hover:text-red-700 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Workspace Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Brief Input Panel */}
          <div className="no-print lg:col-span-5 xl:col-span-4 sticky lg:top-20">
            <BriefInputPanel
              inputData={inputData}
              onChange={handleUpdateInput}
              onGenerate={handleGenerate}
              isLoading={isLoading}
              onSelectSample={handleSelectSample}
            />
          </div>

          {/* Right Column: Proposal Preview & Studio */}
          <div className="lg:col-span-7 xl:col-span-8 min-w-0">
            {proposal ? (
              <ProposalViewer
                proposal={proposal}
                onUpdateProposal={setProposal}
                onRegenerate={handleGenerate}
                onRefine={handleRefineProposal}
                isRefining={isRefining}
                onPrint={handlePrint}
              />
            ) : (
              <EmptyState onSelectSample={handleSelectSample} />
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="no-print border-t border-slate-200 bg-white py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-800">ScopeSnap AI</span>
            <span>• Built for Indian & Global Freelance Web Developers</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Anti-Scope Creep</span>
            <span>•</span>
            <span>Zero Price Fabrication</span>
            <span>•</span>
            <span>Milestone Estimates</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
