import React, { useState } from 'react';
import {
  CheckCircle2,
  Download,
  Copy,
  Check,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  FileCheck,
  Shield,
  Key,
  GitBranch,
  Calendar,
  UserCheck,
} from 'lucide-react';
import { IssueResponse } from '../types';
import { copyToClipboard, downloadBase64Pdf, truncateMiddle } from '../utils/crypto';

interface IssuanceResultProps {
  data: IssueResponse;
  onReset?: () => void;
}

export const IssuanceResult: React.FC<IssuanceResultProps> = ({ data, onReset }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [signatureExpanded, setSignatureExpanded] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleCopy = async (key: string, text: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  const handleDownload = () => {
    try {
      const filename = `trustdoc-stamped-${data.document_id.slice(0, 8)}.pdf`;
      downloadBase64Pdf(data.stamped_pdf_b64, filename);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      alert('Error triggering download: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  const formatDate = (isoStr: string) => {
    try {
      return new Date(isoStr).toLocaleString();
    } catch {
      return isoStr;
    }
  };

  return (
    <div className="w-full bg-slate-900 border border-emerald-500/30 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-emerald-500/5 space-y-6">
      {/* Success Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              Document Cryptographically Stamped
            </h2>
            <p className="text-sm text-slate-400">
              Fingerprinted with SHA-256 and signed with ECDSA P-256.
            </p>
          </div>
        </div>

        {/* Primary Action: Download Stamped PDF */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all cursor-pointer transform active:scale-95"
          >
            {downloadSuccess ? (
              <>
                <Check className="w-4 h-4 text-slate-950" />
                <span>Downloaded!</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download Stamped PDF</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Cryptographic Receipt Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Document ID */}
        <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-400" /> Document ID (UUID)
            </span>
            <button
              onClick={() => handleCopy('docId', data.document_id)}
              className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors"
              title="Copy Document ID"
            >
              {copiedKey === 'docId' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
          <code className="text-sm font-mono text-slate-200 select-all break-all">
            {data.document_id}
          </code>
        </div>

        {/* Issuer Name & Issued At */}
        <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-teal-400" /> Issuer & Date
            </span>
            <span className="text-xs text-slate-500 font-mono">Index #{data.merkle_leaf_index}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-emerald-400">{data.issuer_name || 'Official Authority'}</span>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-500" />
              {formatDate(data.issued_at)}
            </span>
          </div>
        </div>

        {/* SHA-256 Digest */}
        <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 md:col-span-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <FileCheck className="w-3.5 h-3.5 text-emerald-400" /> SHA-256 Cryptographic Hash
            </span>
            <button
              onClick={() => handleCopy('sha256', data.sha256_digest)}
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              {copiedKey === 'sha256' ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" /> Copied
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" /> Copy Hash
                </>
              )}
            </button>
          </div>
          <code className="text-xs sm:text-sm font-mono text-emerald-400 bg-slate-900/90 p-2.5 rounded-lg border border-slate-800/80 block break-all select-all">
            {data.sha256_digest}
          </code>
        </div>

        {/* Merkle Root */}
        <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 md:col-span-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <GitBranch className="w-3.5 h-3.5 text-blue-400" /> Merkle Transparency Root
            </span>
            <button
              onClick={() => handleCopy('merkle', data.merkle_root)}
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              {copiedKey === 'merkle' ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" /> Copied
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" /> Copy Root
                </>
              )}
            </button>
          </div>
          <code className="text-xs sm:text-sm font-mono text-blue-300 bg-slate-900/90 p-2.5 rounded-lg border border-slate-800/80 block break-all select-all">
            {data.merkle_root}
          </code>
        </div>

        {/* ECDSA Signature */}
        <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 md:col-span-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-teal-400" /> ECDSA P-256 Digital Signature (Base64)
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSignatureExpanded(!signatureExpanded)}
                className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                {signatureExpanded ? (
                  <>
                    <ChevronUp className="w-3 h-3" /> Collapse
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-3 h-3" /> Expand
                  </>
                )}
              </button>
              <button
                onClick={() => handleCopy('signature', data.signature)}
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                {copiedKey === 'signature' ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" /> Copy
                  </>
                )}
              </button>
            </div>
          </div>
          <code className="text-xs font-mono text-teal-300/90 bg-slate-900/90 p-2.5 rounded-lg border border-slate-800/80 block break-all select-all">
            {signatureExpanded ? data.signature : truncateMiddle(data.signature, 30, 20)}
          </code>
        </div>

        {/* Verification URL */}
        <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 md:col-span-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Public Verification Link (QR Target)
            </span>
            <div>
              <a
                href={data.verification_url || `/verify/${data.document_id}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs sm:text-sm font-mono text-emerald-400 hover:underline flex items-center gap-1.5 break-all"
              >
                {data.verification_url || `${window.location.origin}/verify/${data.document_id}`}
                <ExternalLink className="w-3.5 h-3.5 inline-block shrink-0" />
              </a>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => handleCopy('verifyUrl', data.verification_url || `${window.location.origin}/verify/${data.document_id}`)}
              className="inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-white px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
            >
              {copiedKey === 'verifyUrl' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copy Link</span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer Controls */}
      {onReset && (
        <div className="pt-4 flex justify-end">
          <button
            onClick={onReset}
            className="text-sm text-slate-400 hover:text-emerald-400 transition-colors font-medium"
          >
            ← Issue another document
          </button>
        </div>
      )}
    </div>
  );
};
