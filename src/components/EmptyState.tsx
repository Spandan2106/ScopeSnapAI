import React from 'react';
import {
  ShieldAlert,
  Coins,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  FileText,
  MessageSquare
} from 'lucide-react';
import { SAMPLE_BRIEFS } from '../data/sampleBriefs.ts';
import { SampleBrief } from '../types.ts';

interface EmptyStateProps {
  onSelectSample: (sample: SampleBrief) => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onSelectSample }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 sm:p-10 flex flex-col justify-center min-h-[680px]">
      <div className="max-w-2xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60 mb-4">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span>Engineered for Freelancers & Independent Agencies</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Turn Unclear Client Inquiries Into Winning Proposals
        </h2>

        <p className="text-sm text-slate-600 mt-3 leading-relaxed">
          Stop getting trapped in endless revisions or guessing project scopes over WhatsApp.
          ScopeSnap AI extracts confirmed requirements, assumptions, explicit exclusions, and milestone timelines in seconds.
        </p>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-8 text-left">
          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 transition-colors">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center mb-2.5">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-slate-900 mb-1">Confirmed vs. Assumptions</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Separates what the client explicitly said from technical deductions, preventing misunderstandings.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 transition-colors">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center mb-2.5">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-slate-900 mb-1">Explicit Exclusions & Anti-Creep</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Clearly documents what is NOT included (e.g. data entry, custom gateways, continuous SEO) to safeguard profit margins.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 transition-colors">
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center mb-2.5">
              <Clock className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-slate-900 mb-1">Milestone Timelines as Estimates</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Provides phase-by-phase working day estimates linked to client dependencies like assets and sign-offs.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 transition-colors">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center mb-2.5">
              <Coins className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-slate-900 mb-1">Zero Price Guessing</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Never fabricates a fee when the client didn't supply one; leaves placeholders so you set your rates.
            </p>
          </div>
        </div>

        {/* Quick Launch CTA */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Try a real-world scenario right now:
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {SAMPLE_BRIEFS.slice(0, 3).map((sample) => (
              <button
                key={sample.id}
                type="button"
                onClick={() => onSelectSample(sample)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:border-indigo-400 hover:bg-indigo-50/40 text-xs font-medium text-slate-700 transition-all shadow-2xs group"
              >
                <span>{sample.title}</span>
                <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
