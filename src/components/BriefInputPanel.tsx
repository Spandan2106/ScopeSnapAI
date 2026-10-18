import React, { useState, useRef } from 'react';
import {
  Sparkles,
  Clipboard,
  X,
  Image as ImageIcon,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Briefcase,
  User,
  Sliders,
  DollarSign,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { ProjectBriefInput, SampleBrief } from '../types.ts';
import { SAMPLE_BRIEFS } from '../data/sampleBriefs.ts';

interface BriefInputPanelProps {
  inputData: ProjectBriefInput;
  onChange: (updated: Partial<ProjectBriefInput>) => void;
  onGenerate: () => void;
  isLoading: boolean;
  onSelectSample: (sample: SampleBrief) => void;
}

export const BriefInputPanel: React.FC<BriefInputPanelProps> = ({
  inputData,
  onChange,
  onGenerate,
  isLoading,
  onSelectSample,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(true);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const wordCount = inputData.brief.trim() ? inputData.brief.trim().split(/\s+/).length : 0;
  const charCount = inputData.brief.length;

  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        onChange({ brief: inputData.brief ? `${inputData.brief}\n\n${text}` : text });
      }
    } catch {
      // Fallback
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processImageFile(file);
  };

  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, WebP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        // format: data:image/png;base64,.....
        const base64Data = result.split(',')[1];
        onChange({
          imageBase64: base64Data,
          imageMimeType: file.type,
          imageFileName: file.name,
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const removeImage = () => {
    onChange({
      imageBase64: undefined,
      imageMimeType: undefined,
      imageFileName: undefined,
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      if (!isLoading && (inputData.brief.trim() || inputData.imageBase64)) {
        onGenerate();
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 lg:p-6 flex flex-col gap-5">
      {/* Sample Briefs Quick Selector */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            Quick Test With Sample Briefs
          </label>
          <span className="text-xs text-slate-400">1-click fill</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {SAMPLE_BRIEFS.map((sample) => (
            <button
              key={sample.id}
              type="button"
              onClick={() => onSelectSample(sample)}
              className="text-left p-2.5 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/40 transition-all group"
            >
              <div className="text-[11px] font-semibold text-indigo-700 truncate mb-0.5">
                {sample.category}
              </div>
              <div className="text-xs font-medium text-slate-800 line-clamp-1 group-hover:text-indigo-900">
                {sample.title}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Brief Text Area */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="brief-input" className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <span>Client Inquiry or Project Brief</span>
            <span className="text-red-500 font-normal">*</span>
          </label>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePasteClipboard}
              className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium px-2 py-1 rounded hover:bg-indigo-50 transition-colors"
              title="Paste from clipboard"
            >
              <Clipboard className="w-3 h-3" />
              <span>Paste</span>
            </button>

            {inputData.brief && (
              <button
                type="button"
                onClick={() => onChange({ brief: '' })}
                className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 px-2 py-1 rounded hover:bg-slate-100 transition-colors"
                title="Clear brief"
              >
                <X className="w-3 h-3" />
                <span>Clear</span>
              </button>
            )}
          </div>
        </div>

        <div className="relative">
          <textarea
            id="brief-input"
            rows={7}
            value={inputData.brief}
            onChange={(e) => onChange({ brief: e.target.value })}
            onKeyDown={handleKeyDown}
            placeholder="Paste your client's raw inquiry here...
Examples:
• WhatsApp message thread or audio transcription
• Email inquiry or rough requirements list
• 'Need an e-commerce website with Razorpay by next month'

ScopeSnap AI will analyze confirmed specs, assumptions, missing info, milestone breakdown, pricing, and exclusions."
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-4 text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all resize-y font-normal leading-relaxed"
          />

          <div className="flex items-center justify-between mt-1.5 px-1 text-xs text-slate-400">
            <span>
              {wordCount} words • {charCount} chars
            </span>
            <span className="hidden sm:inline text-slate-400">
              Press <kbd className="px-1 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px] font-mono">⌘</kbd> + <kbd className="px-1 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px] font-mono">Enter</kbd> to generate
            </span>
          </div>
        </div>
      </div>

      {/* Optional Screenshot / Attachment Upload */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
            <span>Attach Inquiry Screenshot or Mockup</span>
            <span className="text-slate-400 font-normal">(Optional)</span>
          </label>
        </div>

        {inputData.imageBase64 ? (
          <div className="flex items-center justify-between p-3 rounded-xl border border-indigo-200 bg-indigo-50/50">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-200 shrink-0 border border-slate-300">
                <img
                  src={`data:${inputData.imageMimeType || 'image/png'};base64,${inputData.imageBase64}`}
                  alt="Inquiry preview"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="truncate">
                <p className="text-xs font-medium text-slate-900 truncate">
                  {inputData.imageFileName || 'Attached screenshot'}
                </p>
                <p className="text-[11px] text-indigo-700">Included in Gemini visual brief analysis</p>
              </div>
            </div>
            <button
              type="button"
              onClick={removeImage}
              className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-white transition-colors"
              title="Remove image"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border border-dashed rounded-xl p-3 text-center cursor-pointer transition-colors ${
              dragOver
                ? 'border-indigo-500 bg-indigo-50/60'
                : 'border-slate-200 hover:border-slate-300 bg-slate-50/30 hover:bg-slate-50'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            <p className="text-xs text-slate-600 font-medium">
              Drop screenshot of WhatsApp chat, wireframe, or client email
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">PNG, JPG, or WebP up to 10MB</p>
          </div>
        )}
      </div>

      {/* Freelancer, Deal & Tone Settings (Collapsible) */}
      <div className="border-t border-slate-100 pt-4">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center justify-between w-full text-xs font-semibold text-slate-700 uppercase tracking-wider hover:text-slate-900 transition-colors py-1"
        >
          <span className="flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-indigo-500" />
            Proposal Parameters & Context
          </span>
          {showAdvanced ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {showAdvanced && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3 pt-1">
            {/* Freelancer Name */}
            <div>
              <label className="text-xs font-medium text-slate-700 flex items-center gap-1 mb-1">
                <User className="w-3 h-3 text-slate-400" />
                Freelancer / Your Name
              </label>
              <input
                type="text"
                value={inputData.freelancerName}
                onChange={(e) => onChange({ freelancerName: e.target.value })}
                placeholder="e.g. Aarav Mehta"
                className="w-full text-xs rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 outline-none"
              />
            </div>

            {/* Business / Agency Name */}
            <div>
              <label className="text-xs font-medium text-slate-700 flex items-center gap-1 mb-1">
                <Briefcase className="w-3 h-3 text-slate-400" />
                Business / Studio Name
              </label>
              <input
                type="text"
                value={inputData.businessName}
                onChange={(e) => onChange({ businessName: e.target.value })}
                placeholder="e.g. PixelCraft Solutions"
                className="w-full text-xs rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 outline-none"
              />
            </div>

            {/* Client Name */}
            <div>
              <label className="text-xs font-medium text-slate-700 flex items-center gap-1 mb-1">
                <User className="w-3 h-3 text-slate-400" />
                Client Name <span className="text-slate-400 font-normal">(if known)</span>
              </label>
              <input
                type="text"
                value={inputData.clientName}
                onChange={(e) => onChange({ clientName: e.target.value })}
                placeholder="e.g. Sunita Sharma"
                className="w-full text-xs rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 outline-none"
              />
            </div>

            {/* Currency */}
            <div>
              <label className="text-xs font-medium text-slate-700 flex items-center gap-1 mb-1">
                <DollarSign className="w-3 h-3 text-slate-400" />
                Currency
              </label>
              <select
                value={inputData.currency}
                onChange={(e) => onChange({ currency: e.target.value })}
                className="w-full text-xs rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 outline-none"
              >
                <option value="INR">INR (₹) - Indian Rupee (Default)</option>
                <option value="USD">USD ($) - US Dollar</option>
                <option value="EUR">EUR (€) - Euro</option>
                <option value="GBP">GBP (£) - British Pound</option>
                <option value="AED">AED (د.إ) - UAE Dirham</option>
                <option value="SGD">SGD (S$) - Singapore Dollar</option>
                <option value="CAD">CAD ($) - Canadian Dollar</option>
                <option value="AUD">AUD ($) - Australian Dollar</option>
              </select>
            </div>

            {/* Preferred Tone */}
            <div>
              <label className="text-xs font-medium text-slate-700 flex items-center gap-1 mb-1">
                Proposal Tone
              </label>
              <select
                value={inputData.tone}
                onChange={(e) => onChange({ tone: e.target.value })}
                className="w-full text-xs rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 outline-none"
              >
                <option value="Consultative & Warm">Consultative & Warm (Builds rapport & trust)</option>
                <option value="Professional & Direct">Professional & Direct (Standard Agency tone)</option>
                <option value="Executive & Crisp">Executive & Crisp (C-level / Founder style)</option>
                <option value="Technical & Structured">Technical & Structured (Engineering emphasis)</option>
              </select>
            </div>

            {/* Estimated Budget */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-slate-700 flex items-center gap-1">
                  Estimated Budget <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <span
                  className="text-[10px] text-slate-400 cursor-help"
                  title="If empty, ScopeSnap AI will never guess a quote. It will leave prices as [To Be Quoted] for you to input."
                >
                  <HelpCircle className="w-3 h-3 inline" /> No guessing
                </span>
              </div>
              <input
                type="text"
                value={inputData.estimatedBudget}
                onChange={(e) => onChange({ estimatedBudget: e.target.value })}
                placeholder="e.g. 75,000 (leave blank to quote later)"
                className="w-full text-xs rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 outline-none"
              />
            </div>

            {/* Target Timeline */}
            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-slate-700 flex items-center gap-1 mb-1">
                <Calendar className="w-3 h-3 text-slate-400" />
                Target Timeline Target <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={inputData.targetTimeline}
                onChange={(e) => onChange({ targetTimeline: e.target.value })}
                placeholder="e.g. 3-4 weeks, or before festive season"
                className="w-full text-xs rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 outline-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* AI Guardrail Callout */}
      <div className="p-3 bg-amber-50/70 border border-amber-200/60 rounded-xl flex items-start gap-2.5 text-xs text-amber-800">
        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-semibold text-amber-900">Anti-Scope Creep Guardrail:</span> ScopeSnap AI separates
          explicit client requirements from technical assumptions, lists items strictly out of scope, and flags potential
          revision traps.
        </div>
      </div>

      {/* Primary Action Button */}
      <button
        type="button"
        disabled={isLoading || (!inputData.brief.trim() && !inputData.imageBase64)}
        onClick={onGenerate}
        className={`w-full py-3.5 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-sm ${
          isLoading || (!inputData.brief.trim() && !inputData.imageBase64)
            ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
            : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200 hover:shadow-md'
        }`}
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4 text-indigo-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span>Analyzing Brief & Assembling Scope...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            <span>Generate Scoped Proposal</span>
          </>
        )}
      </button>
    </div>
  );
};
