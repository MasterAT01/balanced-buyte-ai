import React, { useEffect, useState } from 'react';
import { DecisionResult } from '../types';
import { Mail, Share2, Check, Copy, X as CloseIcon, Send } from 'lucide-react';

interface DrsModalsProps {
  result: DecisionResult;
  showEmailModal: boolean;
  setShowEmailModal: (show: boolean) => void;
  showShareModal: boolean;
  setShowShareModal: (show: boolean) => void;
}

export const DrsModals: React.FC<DrsModalsProps> = ({
  result,
  showEmailModal,
  setShowEmailModal,
  showShareModal,
  setShowShareModal,
}) => {
  const [emailInput, setEmailInput] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Close either modal on Escape for keyboard/accessibility support
  useEffect(() => {
    if (!showEmailModal && !showShareModal) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowEmailModal(false);
        setShowShareModal(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [showEmailModal, showShareModal, setShowEmailModal, setShowShareModal]);

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || isSending) return;
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setEmailSent(true);
      setTimeout(() => {
        setEmailSent(false);
        setShowEmailModal(false);
        setEmailInput('');
      }, 1800);
    }, 700);
  };

  const shareText = `My 60-Second Food Decision: ${result.bestBuyteName} paired with ${result.balancedSip.primary} (Score: ${result.meterScore}/100) via Balanced Buyte™ AI!`;
  const shareUrl = window.location.href;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      // Clipboard permission denied or unavailable — fail silently,
      // the WhatsApp/X/Facebook/LinkedIn links above still work.
    }
  };

  const handleNativeShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Balanced Buyte™ DRS Report',
        text: shareText,
        url: shareUrl,
      }).catch(() => {});
    } else {
      handleCopyLink();
    }
  };

  return (
    <>
      {/* Email DRS Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="email-drs-heading"
            className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 relative shadow-2xl animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto"
          >
            <button
              type="button"
              onClick={() => setShowEmailModal(false)}
              aria-label="Close email dialog"
              className="absolute top-4 right-4 text-[#5B7A6E] hover:text-[#0B2E22]"
            >
              <CloseIcon className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-xs font-mono-custom font-bold text-[#1C8354] uppercase tracking-wider">
              <Mail className="w-4 h-4" />
              <span>Email My DRS Card</span>
            </div>

            <h3 id="email-drs-heading" className="font-display font-bold text-lg text-[#0B2E22]">
              Receive Today's Decision Report
            </h3>
            <p className="text-xs text-[#5B7A6E] leading-relaxed">
              Send your full DRS summary, Smart Kitchen™ recipe, and nutrition breakdown directly to your inbox.
            </p>

            {emailSent ? (
              <div className="p-4 bg-[#EAF3EC] border border-[#1C8354] rounded-xl text-center text-xs font-bold text-[#114B36] flex items-center justify-center gap-2">
                <Check className="w-4 h-4 text-[#1C8354]" />
                <span>DRS Card Sent Successfully!</span>
              </div>
            ) : (
              <form onSubmit={handleSendEmail} className="space-y-3">
                <label htmlFor="drs-email-input" className="sr-only">
                  Email address
                </label>
                <input
                  id="drs-email-input"
                  type="email"
                  required
                  disabled={isSending}
                  placeholder="Enter your email address"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#DCE8E1] text-xs focus:outline-none focus:border-[#1C8354] disabled:opacity-60"
                />
                <button
                  type="submit"
                  disabled={isSending}
                  className="w-full py-3 bg-[#1C8354] hover:bg-[#114B36] disabled:opacity-70 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSending ? 'Sending…' : 'Send DRS Report Now'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Share DRS Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="share-drs-heading"
            className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 relative shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <button
              type="button"
              onClick={() => setShowShareModal(false)}
              aria-label="Close share dialog"
              className="absolute top-4 right-4 text-[#5B7A6E] hover:text-[#0B2E22]"
            >
              <CloseIcon className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-xs font-mono-custom font-bold text-[#1C8354] uppercase tracking-wider">
              <Share2 className="w-4 h-4" />
              <span>Share DRS Card</span>
            </div>

            <h3 id="share-drs-heading" className="font-display font-bold text-lg text-[#0B2E22]">
              Share Decision Confidence
            </h3>

            <div className="p-3 bg-[#F5F9F6] border border-[#E2ECE6] rounded-xl text-xs text-[#0B2E22] space-y-1">
              <div className="font-bold">{result.bestBuyteName}</div>
              <div className="text-[11px] text-[#5B7A6E]">Score: {result.meterScore}/100 • {result.goal}</div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-[#25D366]/10 text-[#075E54] font-bold rounded-xl text-center border border-[#25D366]/30 hover:bg-[#25D366]/20 transition-all"
              >
                WhatsApp
              </a>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-black/5 text-black font-bold rounded-xl text-center border border-black/10 hover:bg-black/10 transition-all"
              >
                X (Twitter)
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-[#1877F2]/10 text-[#1877F2] font-bold rounded-xl text-center border border-[#1877F2]/30 hover:bg-[#1877F2]/20 transition-all"
              >
                Facebook
              </a>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-[#0A66C2]/10 text-[#0A66C2] font-bold rounded-xl text-center border border-[#0A66C2]/30 hover:bg-[#0A66C2]/20 transition-all"
              >
                LinkedIn
              </a>
            </div>

            <button type="button"
              onClick={handleNativeShare}
              className="w-full py-3 bg-[#114B36] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer"
            >
              {copiedLink ? <Check className="w-4 h-4 text-[#9FD8BE]" /> : <Copy className="w-4 h-4" />}
              <span>{copiedLink ? 'Link Copied to Clipboard!' : 'Copy Link / Share'}</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};
