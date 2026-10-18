import React, { useState, useRef } from 'react';
import {
  FileText,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Clock,
  DollarSign,
  MessageSquare,
  Copy,
  Check,
  Printer,
  Sparkles,
  Volume2,
  VolumeX,
  Edit3,
  Plus,
  Trash2,
  RefreshCw,
  Send,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  HelpCircle,
  Mail,
  Smartphone
} from 'lucide-react';
import { ScopeProposal, RequirementItem, MilestoneItem, PricingItem, ClarifyingQuestionItem, ExclusionItem, ScopeCreepItem } from '../types.ts';
import { MarkdownView } from './MarkdownView.tsx';
import { copyToClipboard } from '../utils/clipboard.ts';

interface ProposalViewerProps {
  proposal: ScopeProposal;
  onUpdateProposal: (updated: ScopeProposal) => void;
  onRegenerate: () => void;
  onRefine: (instruction: string) => Promise<void>;
  isRefining: boolean;
  onPrint: () => void;
}

type TabType = 'document' | 'features' | 'questions' | 'exclusions' | 'milestones' | 'pricing' | 'messages';

export const ProposalViewer: React.FC<ProposalViewerProps> = ({
  proposal,
  onUpdateProposal,
  onRegenerate,
  onRefine,
  isRefining,
  onPrint,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('document');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [isEditingMarkdown, setIsEditingMarkdown] = useState(false);
  const [markdownDraft, setMarkdownDraft] = useState(proposal.clientFacingProposalMarkdown);
  const [refineText, setRefineText] = useState('');
  
  // TTS State
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Sync markdown draft when proposal updates
  React.useEffect(() => {
    setMarkdownDraft(proposal.clientFacingProposalMarkdown);
  }, [proposal.clientFacingProposalMarkdown]);

  const handleCopy = async (text: string, sectionKey: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopiedSection(sectionKey);
      setTimeout(() => setCopiedSection(null), 2500);
    }
  };

  const handlePlayAudioSummary = async () => {
    if (isPlayingAudio) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setIsPlayingAudio(false);
      return;
    }

    try {
      setIsLoadingAudio(true);
      const narrationText = `Project Proposal: ${proposal.projectTitle}. Summary: ${proposal.executiveSummary}. Core Objective: ${proposal.coreObjective}. Total Estimated Timeline: ${proposal.totalEstimatedTimeline}.`;

      const res = await fetch('/api/generate-tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: narrationText, voice: 'Kore' }),
      });

      if (!res.ok) {
        throw new Error('TTS server call failed');
      }

      const data = await res.json();
      if (data.audioBase64) {
        const audioSrc = `data:audio/wav;base64,${data.audioBase64}`;
        if (!audioRef.current) {
          audioRef.current = new Audio();
        }
        audioRef.current.src = audioSrc;
        audioRef.current.onended = () => setIsPlayingAudio(false);
        audioRef.current.onerror = () => setIsPlayingAudio(false);
        await audioRef.current.play();
        setIsPlayingAudio(true);
      }
    } catch (err) {
      console.warn('Fallback to browser SpeechSynthesis:', err);
      // Browser Web Speech API fallback
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(
          `${proposal.projectTitle}. ${proposal.executiveSummary}`
        );
        utterance.rate = 1.0;
        utterance.onend = () => setIsPlayingAudio(false);
        utterance.onerror = () => setIsPlayingAudio(false);
        window.speechSynthesis.speak(utterance);
        setIsPlayingAudio(true);
      }
    } finally {
      setIsLoadingAudio(false);
    }
  };

  const handleSaveMarkdownEdit = () => {
    onUpdateProposal({
      ...proposal,
      clientFacingProposalMarkdown: markdownDraft,
    });
    setIsEditingMarkdown(false);
  };

  const handleRefineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refineText.trim() || isRefining) return;
    await onRefine(refineText.trim());
    setRefineText('');
  };

  // Helper mutations for items
  const updateRequirement = (index: number, updatedItem: RequirementItem) => {
    const list = [...proposal.requirements];
    list[index] = updatedItem;
    onUpdateProposal({ ...proposal, requirements: list });
  };

  const deleteRequirement = (index: number) => {
    const list = proposal.requirements.filter((_, i) => i !== index);
    onUpdateProposal({ ...proposal, requirements: list });
  };

  const addRequirement = () => {
    const newItem: RequirementItem = {
      id: `req-${Date.now()}`,
      category: 'General',
      title: 'New Scoped Requirement',
      description: 'Describe client requirement here...',
      isConfirmed: true,
      priority: 'Must-Have',
      deliverable: 'Specific output deliverable',
    };
    onUpdateProposal({ ...proposal, requirements: [...proposal.requirements, newItem] });
  };

  const updateMilestone = (index: number, updatedItem: MilestoneItem) => {
    const list = [...proposal.milestones];
    list[index] = updatedItem;
    onUpdateProposal({ ...proposal, milestones: list });
  };

  const deleteMilestone = (index: number) => {
    const list = proposal.milestones.filter((_, i) => i !== index);
    onUpdateProposal({ ...proposal, milestones: list });
  };

  const addMilestone = () => {
    const newMilestone: MilestoneItem = {
      id: `m-${Date.now()}`,
      phaseNumber: proposal.milestones.length + 1,
      title: 'Sprint / Phase Title',
      estimatedDuration: '5-7 business days (Est.)',
      deliverables: ['Deliverable item 1'],
      clientDependencies: 'Client feedback and sign-off',
    };
    onUpdateProposal({ ...proposal, milestones: [...proposal.milestones, newMilestone] });
  };

  const updatePricingItem = (index: number, updatedItem: PricingItem) => {
    const list = [...proposal.pricing.items];
    list[index] = updatedItem;
    onUpdateProposal({
      ...proposal,
      pricing: { ...proposal.pricing, items: list },
    });
  };

  const deletePricingItem = (index: number) => {
    const list = proposal.pricing.items.filter((_, i) => i !== index);
    onUpdateProposal({
      ...proposal,
      pricing: { ...proposal.pricing, items: list },
    });
  };

  const addPricingItem = () => {
    const newItem: PricingItem = {
      id: `price-${Date.now()}`,
      item: 'New Deliverable or Service',
      description: 'Scope description',
      cost: proposal.currency === 'INR' ? '₹15,000' : '$300',
      isEstimated: true,
    };
    onUpdateProposal({
      ...proposal,
      pricing: { ...proposal.pricing, items: [...proposal.pricing.items, newItem] },
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col min-h-[750px] overflow-hidden">
      {/* Proposal Header Banner */}
      <div className="no-print p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
              {proposal.currency} Proposal
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                proposal.confidenceScore.toLowerCase().includes('high')
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                  : 'bg-amber-500/20 text-amber-300 border-amber-400/30'
              }`}
            >
              Confidence: {proposal.confidenceScore}
            </span>
            <span className="text-xs text-slate-400">Tone: {proposal.tone}</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>{proposal.projectTitle}</span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl line-clamp-2">
            {proposal.coreObjective || proposal.executiveSummary}
          </p>
        </div>

        {/* Top Quick Actions */}
        <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
          {/* TTS Audio Button */}
          <button
            type="button"
            onClick={handlePlayAudioSummary}
            disabled={isLoadingAudio}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
              isPlayingAudio
                ? 'bg-red-500/20 border-red-400/40 text-red-200 animate-pulse'
                : 'bg-white/10 hover:bg-white/20 border-white/15 text-white'
            }`}
            title="Listen to Executive Proposal Summary using Gemini TTS"
          >
            {isPlayingAudio ? (
              <>
                <VolumeX className="w-3.5 h-3.5" />
                <span>Stop Audio</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 text-indigo-300" />
                <span>{isLoadingAudio ? 'Loading Audio...' : 'Listen Summary'}</span>
              </>
            )}
          </button>

          {/* Copy Full Proposal */}
          <button
            type="button"
            onClick={() => handleCopy(proposal.clientFacingProposalMarkdown, 'full-proposal')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-colors"
          >
            {copiedSection === 'full-proposal' ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-300" />
                <span>Copy Full Proposal</span>
              </>
            )}
          </button>

          {/* Regenerate */}
          <button
            type="button"
            onClick={onRegenerate}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-colors"
            title="Re-run Gemini analysis with fresh insights"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-300" />
            <span className="hidden sm:inline">Regenerate</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="no-print border-b border-slate-200 bg-slate-50/70 px-4 sm:px-6 overflow-x-auto scrollbar-none">
        <div className="flex space-x-1 sm:space-x-3 py-2 min-w-max">
          <button
            type="button"
            onClick={() => setActiveTab('document')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'document'
                ? 'bg-white text-indigo-700 shadow-2xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-indigo-600" />
            <span>Full Proposal Document</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('features')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'features'
                ? 'bg-white text-indigo-700 shadow-2xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Scope & Deliverables</span>
            <span className="px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded text-[10px]">
              {proposal.requirements.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('questions')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'questions'
                ? 'bg-white text-indigo-700 shadow-2xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
            <span>Clarifying Questions</span>
            <span className="px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded text-[10px]">
              {proposal.clarifyingQuestions.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('exclusions')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'exclusions'
                ? 'bg-white text-indigo-700 shadow-2xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
            <span>Exclusions & Anti-Creep</span>
            <span className="px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded text-[10px]">
              {proposal.explicitExclusions.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('milestones')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'milestones'
                ? 'bg-white text-indigo-700 shadow-2xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-purple-600" />
            <span>Milestones & Timeline</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('pricing')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'pricing'
                ? 'bg-white text-indigo-700 shadow-2xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
            <span>Pricing & Commercials</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('messages')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'messages'
                ? 'bg-white text-indigo-700 shadow-2xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
            <span>Client Cover Messages</span>
          </button>
        </div>
      </div>

      {/* Main Tab Content Area */}
      <div className="p-5 sm:p-6 flex-1 overflow-y-auto">
        {/* TAB 1: FULL PROPOSAL DOCUMENT */}
        {activeTab === 'document' && (
          <div className="proposal-print-container space-y-4">
            <div className="no-print flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Client Proposal Document View
                </span>
                <span className="text-xs text-slate-400">• Ready to deliver</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditingMarkdown(!isEditingMarkdown)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{isEditingMarkdown ? 'Preview Mode' : 'Edit Document'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleCopy(proposal.clientFacingProposalMarkdown, 'doc-copy')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 text-xs font-medium text-indigo-700 hover:bg-indigo-100 transition-colors"
                >
                  {copiedSection === 'doc-copy' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Copy Markdown</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={onPrint}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-600" />
                  <span>Print / PDF</span>
                </button>
              </div>
            </div>

            {/* Print Header Visible ONLY during print */}
            <div className="hidden print-only mb-6 pb-4 border-b border-slate-300">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">{proposal.projectTitle}</h1>
                  <p className="text-sm text-slate-600 mt-1">Prepared for: {proposal.clientName}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-900">
                    {proposal.agencyName || proposal.freelancerName}
                  </p>
                  <p className="text-xs text-slate-500">Date: {new Date().toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            {isEditingMarkdown ? (
              <div className="space-y-3">
                <div className="p-2.5 bg-indigo-50/70 border border-indigo-200 rounded-lg text-xs text-indigo-800">
                  You are editing the full client proposal markdown. Changes will update the preview and copy exports.
                </div>
                <textarea
                  rows={24}
                  value={markdownDraft}
                  onChange={(e) => setMarkdownDraft(e.target.value)}
                  className="w-full font-mono text-xs sm:text-sm text-slate-800 bg-slate-50 border border-slate-300 rounded-xl p-4 focus:bg-white focus:border-indigo-500 outline-none leading-relaxed"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMarkdownDraft(proposal.clientFacingProposalMarkdown);
                      setIsEditingMarkdown(false);
                    }}
                    className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveMarkdownEdit}
                    className="px-4 py-2 rounded-lg bg-indigo-600 text-xs font-medium text-white hover:bg-indigo-700"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50/40 rounded-xl border border-slate-200/70 p-6 sm:p-8">
                <MarkdownView content={proposal.clientFacingProposalMarkdown} />
              </div>
            )}
          </div>
        )}

        {/* TAB 2: FEATURES & DELIVERABLES */}
        {activeTab === 'features' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Features & Deliverables Breakdown</h3>
                <p className="text-xs text-slate-500">
                  Clearly marks confirmed client requests versus assumed technical specifications
                </p>
              </div>
              <button
                type="button"
                onClick={addRequirement}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold border border-indigo-200 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Deliverable</span>
              </button>
            </div>

            {/* Filter pills explanation */}
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" /> Confirmed Client Request
              </span>
              <span className="flex items-center gap-1.5 text-amber-700 font-medium bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                <AlertTriangle className="w-3.5 h-3.5" /> Technical / Assumed Deliverable
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {proposal.requirements.map((req, idx) => (
                <div
                  key={req.id || idx}
                  className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all shadow-2xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {req.category}
                      </span>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                            req.isConfirmed
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          {req.isConfirmed ? 'Confirmed' : 'Assumption'}
                        </span>
                        <span className="text-[11px] font-medium text-slate-500 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded">
                          {req.priority}
                        </span>
                        <button
                          type="button"
                          onClick={() => deleteRequirement(idx)}
                          className="text-slate-300 hover:text-red-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <input
                      type="text"
                      value={req.title}
                      onChange={(e) => updateRequirement(idx, { ...req, title: e.target.value })}
                      className="w-full font-semibold text-slate-900 text-sm mb-1.5 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-500 focus:bg-slate-50 px-1 py-0.5 outline-none rounded"
                    />

                    <textarea
                      rows={2}
                      value={req.description}
                      onChange={(e) => updateRequirement(idx, { ...req, description: e.target.value })}
                      className="w-full text-xs text-slate-600 leading-relaxed bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-500 focus:bg-slate-50 px-1 py-0.5 outline-none rounded resize-none"
                    />
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Deliverable:</span>
                    <span className="font-medium text-indigo-700 bg-indigo-50/70 px-2 py-0.5 rounded border border-indigo-100">
                      {req.deliverable}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: CLARIFYING QUESTIONS */}
        {activeTab === 'questions' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Missing Information & Clarifying Questions</h3>
                <p className="text-xs text-slate-500">
                  Critical questions to send the client before locking the quote or timeline
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  const questionsFormatted = proposal.clarifyingQuestions
                    .map((q, i) => `${i + 1}. *${q.category}*: ${q.question} _(Why: ${q.whyItMatters})_`)
                    .join('\n\n');
                  const message = `Hi ${proposal.clientName},\n\nTo make sure we quote this accurately and avoid unexpected surprises, I have a few quick clarifying questions:\n\n${questionsFormatted}\n\nLooking forward to your thoughts!`;
                  handleCopy(message, 'questions-copy');
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold border border-blue-200 transition-colors"
              >
                {copiedSection === 'questions-copy' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Copied Questions!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Questions for WhatsApp/Email</span>
                  </>
                )}
              </button>
            </div>

            <div className="space-y-3">
              {proposal.clarifyingQuestions.map((q, idx) => (
                <div
                  key={q.id || idx}
                  className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-300 transition-colors shadow-2xs"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold text-slate-800">{q.category}</span>
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.2 rounded-full ${
                              q.severity === 'Critical'
                                ? 'bg-red-50 text-red-700 border border-red-200'
                                : 'bg-blue-50 text-blue-700 border border-blue-200'
                            }`}
                          >
                            {q.severity}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-slate-900 leading-snug">{q.question}</p>
                        <p className="text-xs text-slate-500 mt-1">
                          <strong className="text-slate-600">Why it matters:</strong> {q.whyItMatters}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: EXCLUSIONS & ANTI-SCOPE CREEP */}
        {activeTab === 'exclusions' && (
          <div className="space-y-6">
            <div className="pb-3 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                <span>Scope Protection & Explicit Exclusions</span>
              </h3>
              <p className="text-xs text-slate-500">
                Safeguard against endless unpaid revisions, free feature additions, and out-of-scope work
              </p>
            </div>

            {/* Explicit Out-of-Scope Items */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                Explicitly Out of Scope (Included in Client Proposal)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {proposal.explicitExclusions.map((ex, idx) => (
                  <div
                    key={ex.id || idx}
                    className="p-3.5 rounded-xl border border-red-100 bg-red-50/40 text-slate-800 text-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="font-semibold text-red-900 mb-1 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
                        {ex.item}
                      </div>
                      <p className="text-slate-600 text-xs leading-relaxed">{ex.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Scope Creep Risk Watchlist */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                Scope Creep Risk Analysis & Recommended Boundaries
              </h4>
              <div className="space-y-3">
                {proposal.scopeCreepFlags.map((flag, idx) => (
                  <div
                    key={flag.id || idx}
                    className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 text-xs"
                  >
                    <div className="font-semibold text-amber-900 text-xs mb-1">
                      ⚠️ Risk: {flag.risk}
                    </div>
                    <div className="text-slate-700 leading-relaxed">
                      <strong className="text-slate-900">Recommended Boundary:</strong> {flag.mitigation}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Assumptions List */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3">
                Project Baseline Assumptions
              </h4>
              <div className="space-y-2">
                {proposal.assumptions.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="p-3 rounded-lg border border-slate-200 bg-slate-50 text-xs flex items-start gap-2"
                  >
                    <span className="text-indigo-600 font-bold shrink-0 mt-0.5">•</span>
                    <div>
                      <span className="font-medium text-slate-800">{item.item}</span>
                      <span className="text-slate-500 ml-1.5">— {item.impact}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: MILESTONES & TIMELINE */}
        {activeTab === 'milestones' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Estimated Milestone Timeline</h3>
                <p className="text-xs text-slate-500">
                  Clearly marked as working day estimates, contingent on client dependencies
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 border border-purple-200">
                  Est. Total: {proposal.totalEstimatedTimeline}
                </span>
                <button
                  type="button"
                  onClick={addMilestone}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold border border-indigo-200 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Phase</span>
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {proposal.milestones.map((m, idx) => (
                <div
                  key={m.id || idx}
                  className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-white hover:border-purple-300 transition-all shadow-2xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-purple-100 text-purple-800 text-xs font-bold flex items-center justify-center shrink-0">
                        {m.phaseNumber}
                      </span>
                      <input
                        type="text"
                        value={m.title}
                        onChange={(e) => updateMilestone(idx, { ...m, title: e.target.value })}
                        className="font-bold text-slate-900 text-sm sm:text-base bg-transparent hover:bg-slate-50 px-1 py-0.5 rounded outline-none border-b border-transparent focus:border-indigo-500"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={m.estimatedDuration}
                        onChange={(e) => updateMilestone(idx, { ...m, estimatedDuration: e.target.value })}
                        className="text-xs font-semibold text-purple-700 bg-purple-50 border border-purple-200 rounded px-2.5 py-1 outline-none text-right"
                      />
                      <button
                        type="button"
                        onClick={() => deleteMilestone(idx)}
                        className="text-slate-300 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Deliverables in this milestone */}
                  <div className="text-xs mb-3">
                    <span className="font-semibold text-slate-700 block mb-1">Key Deliverables:</span>
                    <ul className="list-disc pl-5 space-y-1 text-slate-600">
                      {m.deliverables.map((del, dIdx) => (
                        <li key={dIdx}>{del}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Client Dependencies */}
                  <div className="pt-2.5 border-t border-slate-100 text-xs flex items-center gap-2 text-slate-500 bg-slate-50/70 p-2 rounded-lg">
                    <span className="font-semibold text-slate-700 shrink-0">Client Dependency:</span>
                    <span className="text-slate-600 truncate">{m.clientDependencies}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: PRICING & COMMERCIALS */}
        {activeTab === 'pricing' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Commercials & Investment Breakdown</h3>
                <p className="text-xs text-slate-500">
                  {proposal.pricing.budgetProvided
                    ? 'Breakdown allocated based on client budget indication'
                    : 'Editable quote table. ScopeSnap AI does not fabricate quotes when no price was provided.'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Model: {proposal.pricing.pricingModel}
                </span>
                <button
                  type="button"
                  onClick={addPricingItem}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold border border-indigo-200 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Line Item</span>
                </button>
              </div>
            </div>

            {/* Pricing Items Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Milestone / Scope Component</th>
                    <th className="py-3 px-4 hidden sm:table-cell">Deliverable Scope</th>
                    <th className="py-3 px-4 text-right">Cost ({proposal.currency})</th>
                    <th className="py-3 px-2 text-center w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {proposal.pricing.items.map((item, idx) => (
                    <tr key={item.id || idx} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          value={item.item}
                          onChange={(e) => updatePricingItem(idx, { ...item, item: e.target.value })}
                          className="w-full font-semibold text-slate-900 bg-transparent outline-none focus:bg-white p-1 rounded border border-transparent focus:border-slate-300"
                        />
                      </td>
                      <td className="py-3 px-4 hidden sm:table-cell text-slate-500">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => updatePricingItem(idx, { ...item, description: e.target.value })}
                          className="w-full text-slate-600 bg-transparent outline-none focus:bg-white p-1 rounded border border-transparent focus:border-slate-300"
                        />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <input
                          type="text"
                          value={item.cost}
                          onChange={(e) => updatePricingItem(idx, { ...item, cost: e.target.value })}
                          className="font-mono font-semibold text-slate-900 bg-transparent outline-none focus:bg-white p-1 rounded border border-transparent focus:border-slate-300 text-right w-32"
                        />
                      </td>
                      <td className="py-3 px-2 text-center">
                        <button
                          type="button"
                          onClick={() => deletePricingItem(idx)}
                          className="text-slate-300 hover:text-red-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-50 font-semibold border-t border-slate-200">
                  <tr>
                    <td colSpan={2} className="py-3 px-4 text-slate-800">
                      Estimated Total Investment
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-sm text-indigo-700">
                      <input
                        type="text"
                        value={proposal.pricing.subtotal}
                        onChange={(e) =>
                          onUpdateProposal({
                            ...proposal,
                            pricing: { ...proposal.pricing, subtotal: e.target.value },
                          })
                        }
                        className="font-bold text-indigo-700 bg-transparent outline-none text-right w-40"
                      />
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Payment Schedule (Standard Freelance Milestone Model) */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Recommended Payment Schedule
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {proposal.pricing.paymentSchedule.map((tier, idx) => (
                  <div key={idx} className="bg-white p-3 rounded-lg border border-slate-200 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-slate-800">{tier.stage}</span>
                      <span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                        {tier.percentage}
                      </span>
                    </div>
                    <p className="text-slate-500 text-[11px] leading-tight">{tier.trigger}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Taxes & Disclaimer */}
            <div className="space-y-2 text-xs text-slate-500">
              <div className="p-3 bg-slate-100 rounded-lg">
                <span className="font-semibold text-slate-700">Taxes:</span> {proposal.pricing.taxNotes}
              </div>
              <p className="italic text-[11px] text-slate-400">
                Notice: {proposal.pricing.disclaimer}
              </p>
            </div>
          </div>
        )}

        {/* TAB 7: CLIENT COVER MESSAGES */}
        {activeTab === 'messages' && (
          <div className="space-y-6">
            <div className="pb-3 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900">Instant Client Messages</h3>
              <p className="text-xs text-slate-500">
                Send a polite, professional follow-up immediately over WhatsApp or Email
              </p>
            </div>

            {/* WhatsApp Ready Message */}
            <div className="p-5 rounded-2xl border border-emerald-200 bg-emerald-50/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wide">
                      WhatsApp Formatted Message
                    </h4>
                    <p className="text-[11px] text-emerald-700">Formatted with *bold* for WhatsApp readability</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopy(proposal.followUpMessageWhatsApp, 'whatsapp')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-2xs transition-colors"
                  >
                    {copiedSection === 'whatsapp' ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy WhatsApp Text</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <textarea
                rows={8}
                value={proposal.followUpMessageWhatsApp}
                onChange={(e) =>
                  onUpdateProposal({
                    ...proposal,
                    followUpMessageWhatsApp: e.target.value,
                  })
                }
                className="w-full text-xs text-slate-800 bg-white border border-emerald-200 rounded-xl p-3.5 focus:border-emerald-500 outline-none leading-relaxed font-sans"
              />
            </div>

            {/* Email Ready Follow-up */}
            <div className="p-5 rounded-2xl border border-blue-200 bg-blue-50/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-blue-950 uppercase tracking-wide">
                      Formal Email Follow-up
                    </h4>
                    <p className="text-[11px] text-blue-700">Includes professional subject line and sign-off</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const fullEmail = `Subject: ${proposal.followUpMessageEmail.subject}\n\n${proposal.followUpMessageEmail.body}`;
                    handleCopy(fullEmail, 'email');
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-2xs transition-colors"
                >
                  {copiedSection === 'email' ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Email</span>
                    </>
                  )}
                </button>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Subject:</label>
                <input
                  type="text"
                  value={proposal.followUpMessageEmail.subject}
                  onChange={(e) =>
                    onUpdateProposal({
                      ...proposal,
                      followUpMessageEmail: {
                        ...proposal.followUpMessageEmail,
                        subject: e.target.value,
                      },
                    })
                  }
                  className="w-full text-xs font-semibold text-slate-900 bg-white border border-blue-200 rounded-lg p-2.5 outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Body:</label>
                <textarea
                  rows={8}
                  value={proposal.followUpMessageEmail.body}
                  onChange={(e) =>
                    onUpdateProposal({
                      ...proposal,
                      followUpMessageEmail: {
                        ...proposal.followUpMessageEmail,
                        body: e.target.value,
                      },
                    })
                  }
                  className="w-full text-xs text-slate-800 bg-white border border-blue-200 rounded-xl p-3.5 focus:border-blue-500 outline-none leading-relaxed font-sans"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* AI Proposal Refinement Bar at Bottom */}
      <div className="no-print border-t border-slate-200 bg-slate-50/90 p-4">
        <form onSubmit={handleRefineSubmit} className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              Tweak & Polish Proposal with Gemini
            </span>
            <span className="text-[11px] text-slate-400">Updates all sections instantly</span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={refineText}
              onChange={(e) => setRefineText(e.target.value)}
              placeholder="e.g. 'Add a 30-day bug fix warranty', 'Shorten timeline to 2 weeks', 'Add 18% GST mention'..."
              disabled={isRefining}
              className="flex-1 text-xs rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 outline-none"
            />
            <button
              type="submit"
              disabled={!refineText.trim() || isRefining}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                !refineText.trim() || isRefining
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
              }`}
            >
              {isRefining ? (
                <>
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  <span>Refining...</span>
                </>
              ) : (
                <>
                  <Send className="w-3 h-3" />
                  <span>Update</span>
                </>
              )}
            </button>
          </div>

          {/* Quick tweak recommendation chips */}
          <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Quick Tweaks:</span>
            {[
              'Add 18% GST clause',
              'Include 30 days post-launch support',
              'Break into 2-week agile sprints',
              'Make tone more consultative',
            ].map((chip) => (
              <button
                key={chip}
                type="button"
                disabled={isRefining}
                onClick={() => onRefine(chip)}
                className="text-[11px] px-2 py-0.5 rounded-md bg-white border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 text-slate-600 transition-colors"
              >
                + {chip}
              </button>
            ))}
          </div>
        </form>
      </div>
    </div>
  );
};
