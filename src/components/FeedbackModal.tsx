import React, { useState } from 'react';
import {
  X,
  MessageSquarePlus,
  Send,
  Copy,
  Check,
  Star,
  Bug,
  Lightbulb,
  Sparkles,
  HelpCircle,
  Mail,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';
import { useToast } from './Toast';
import { TOOLS_REGISTRY } from '../data/toolsRegistry';

export const DEVELOPER_FEEDBACK_EMAIL = 's94094838@gmail.com';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentToolId?: string | null;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  currentToolId,
}) => {
  const { showToast } = useToast();

  const [category, setCategory] = useState<'bug' | 'feature' | 'ui' | 'general' | 'other'>('general');
  const [rating, setRating] = useState<number>(5);
  const [selectedToolId, setSelectedToolId] = useState<string>(currentToolId || 'general');
  const [name, setName] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [includeDiagnostics, setIncludeDiagnostics] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);

  // Update selected tool if prop changes when opening
  React.useEffect(() => {
    if (isOpen) {
      if (currentToolId) {
        setSelectedToolId(currentToolId);
      }
      setSubmitted(false);
      setCopied(false);
    }
  }, [isOpen, currentToolId]);

  if (!isOpen) return null;

  const currentToolObj = TOOLS_REGISTRY.find((t) => t.id === selectedToolId);
  const toolNameDisplay = selectedToolId === 'general' ? 'Entire Website / General' : currentToolObj?.name || selectedToolId;

  const categoryLabels: Record<string, { label: string; icon: any; color: string }> = {
    general: { label: 'General Feedback', icon: Sparkles, color: 'text-blue-500' },
    bug: { label: 'Bug or Calculation Issue', icon: Bug, color: 'text-rose-500' },
    feature: { label: 'New Tool / Feature Idea', icon: Lightbulb, color: 'text-amber-500' },
    ui: { label: 'Design / Usability', icon: Star, color: 'text-purple-500' },
    other: { label: 'Question or Support', icon: HelpCircle, color: 'text-slate-500' },
  };

  const generateFeedbackBody = () => {
    const lines = [
      `=== SMARTTOOLS HUB FEEDBACK ===`,
      `Target Email: ${DEVELOPER_FEEDBACK_EMAIL}`,
      `Category: ${categoryLabels[category]?.label || category}`,
      `Rating: ${rating} / 5 Stars`,
      `Tool / Feature: ${toolNameDisplay} (ID: ${selectedToolId})`,
      `From: ${name ? name : 'Anonymous User'}${userEmail ? ` <${userEmail}>` : ''}`,
      ``,
      `--- USER FEEDBACK / PROBLEM DESCRIPTION ---`,
      message.trim() || '(No extra message provided)',
      ``,
    ];

    if (includeDiagnostics) {
      lines.push(
        `--- DIAGNOSTIC ENVIRONMENT ---`,
        `Timestamp: ${new Date().toISOString()}`,
        `Current URL: ${typeof window !== 'undefined' ? window.location.href : 'N/A'}`,
        `Screen Resolution: ${typeof window !== 'undefined' ? `${window.screen.width}x${window.screen.height}` : 'N/A'}`,
        `User Agent: ${typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A'}`,
        `Status: 100% Launch Delivery Ready`
      );
    }

    return lines.join('\n');
  };

  const handleSendEmail = () => {
    if (!message.trim() && rating === 0) {
      showToast('Please enter a brief message or rating before sending.', 'error');
      return;
    }

    const subject = encodeURIComponent(`[SmartTools Feedback] ${categoryLabels[category]?.label}: ${toolNameDisplay}`);
    const body = encodeURIComponent(generateFeedbackBody());
    const mailtoUrl = `mailto:${DEVELOPER_FEEDBACK_EMAIL}?subject=${subject}&body=${body}`;

    // Save to local submission logs
    try {
      const saved = localStorage.getItem('smarttools_feedback_submissions');
      const list = saved ? JSON.parse(saved) : [];
      list.unshift({
        id: Date.now(),
        date: new Date().toISOString(),
        category,
        rating,
        tool: toolNameDisplay,
        message,
        recipient: DEVELOPER_FEEDBACK_EMAIL,
      });
      localStorage.setItem('smarttools_feedback_submissions', JSON.stringify(list.slice(0, 20)));
    } catch {
      // Ignore localStorage errors
    }

    // Trigger mail client
    window.location.href = mailtoUrl;

    setSubmitted(true);
    showToast(`Opening email client to ${DEVELOPER_FEEDBACK_EMAIL}...`, 'success');
  };

  const handleCopy = async () => {
    const content = generateFeedbackBody();
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(content);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = content;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      showToast('Feedback copied! You can paste it directly into an email to ' + DEVELOPER_FEEDBACK_EMAIL, 'success');
      setTimeout(() => setCopied(false), 3000);
    } catch {
      showToast('Could not copy automatically. Please select text manually.', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <MessageSquarePlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Feedback & Customer Support
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Direct Contact: <span className="font-semibold text-blue-600 dark:text-blue-400">{DEVELOPER_FEEDBACK_EMAIL}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
          {submitted ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-sm">
                <Check className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                  Thank You for Your Feedback!
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                  Your message has been addressed to{' '}
                  <span className="font-bold text-blue-600 dark:text-blue-400">{DEVELOPER_FEEDBACK_EMAIL}</span>.
                  If your mail app didn't open automatically, you can copy the text below and send it directly.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="w-full sm:w-auto px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold flex items-center justify-center gap-2 text-xs transition-colors"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copied to Clipboard!' : 'Copy Formatted Text'}</span>
                </button>
                <a
                  href={`mailto:${DEVELOPER_FEEDBACK_EMAIL}?subject=SmartTools%20Feedback&body=${encodeURIComponent(generateFeedbackBody())}`}
                  className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 text-xs transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  <span>Send via Email App</span>
                </a>
              </div>
            </div>
          ) : (
            <>
              {/* Category selector */}
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">
                  What kind of feedback do you have?
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(Object.keys(categoryLabels) as Array<keyof typeof categoryLabels>).map((key) => {
                    const item = categoryLabels[key];
                    const Icon = item.icon;
                    const isSelected = category === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setCategory(key as any)}
                        className={`flex items-center gap-2 p-2.5 rounded-xl border text-left text-xs font-semibold transition-all ${
                          isSelected
                            ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500/20 shadow-2xs'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750'
                        }`}
                      >
                        <Icon className={`w-4 h-4 shrink-0 ${item.color}`} />
                        <span className="truncate">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tool Context */}
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                  Which Tool or Feature is this about?
                </label>
                <select
                  value={selectedToolId}
                  onChange={(e) => setSelectedToolId(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="general">Entire Hub / General Website Experience</option>
                  <optgroup label="Calculators & Converters">
                    {TOOLS_REGISTRY.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.category})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Utilities & Tools">
                    <option value="pdf-studio">PDF Studio & Converter</option>
                  </optgroup>
                </select>
              </div>

              {/* Star Rating */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    How would you rate this tool / experience?
                  </label>
                  <span className="text-xs font-bold text-amber-500">
                    {rating === 5 ? '⭐⭐⭐⭐⭐ Excellent' : `${rating} / 5 Stars`}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-transform active:scale-95"
                    >
                      <Star
                        className={`w-6 h-6 transition-colors ${
                          star <= rating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-300 dark:text-slate-600'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Feedback Message */}
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                  Your Message or Problem Details <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={
                    category === 'bug'
                      ? 'Describe what happened (e.g. formula result, device, or steps to reproduce)...'
                      : category === 'feature'
                      ? 'What calculator or feature would you like to see added next?'
                      : 'Tell us your thoughts, ideas, or how we can make SmartTools Hub even better...'
                  }
                  className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {/* User Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Your Name (optional)
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex"
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Your Email (if you'd like a reply)
                  </label>
                  <input
                    type="email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              {/* Diagnostics checkbox */}
              <div className="flex items-center gap-2 p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
                <input
                  type="checkbox"
                  id="includeDiagCheck"
                  checked={includeDiagnostics}
                  onChange={(e) => setIncludeDiagnostics(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                />
                <label
                  htmlFor="includeDiagCheck"
                  className="text-[11px] text-slate-600 dark:text-slate-300 cursor-pointer select-none"
                >
                  Attach technical environment info (URL, tool ID, screen size) to help diagnose bugs faster.
                </label>
              </div>

              {/* Email Delivery Direct Badge */}
              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 bg-blue-50/60 dark:bg-blue-950/40 p-2.5 rounded-xl border border-blue-100 dark:border-blue-900/50">
                <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                  <Mail className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  Direct destination: <strong className="text-blue-700 dark:text-blue-300 font-semibold">{DEVELOPER_FEEDBACK_EMAIL}</strong>
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> No Spam Guarantee
                </span>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
          >
            {submitted ? 'Close' : 'Cancel'}
          </button>

          {!submitted && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="px-3 py-2 bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                title="Copy formatted feedback to clipboard"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>

              <button
                type="button"
                onClick={handleSendEmail}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/20 flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit to s94094838@gmail.com</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
