import React, { useState } from 'react';
import {
  FilePlus,
  Loader2,
  Lock,
  Cpu,
  Sparkles,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { FileUploader } from '../components/FileUploader';
import { IssuanceResult } from '../components/IssuanceResult';
import { computeSHA256 } from '../utils/crypto';
import { issueDocument, getErrorMessage } from '../api/client';
import { IssueResponse } from '../types';

export const IssuerDashboard: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [clientHash, setClientHash] = useState<string | null>(null);
  const [isHashing, setIsHashing] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [issuanceResult, setIssuanceResult] = useState<IssueResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileSelect = async (file: File) => {
    setSelectedFile(file);
    setErrorMessage(null);
    setIssuanceResult(null);
    setClientHash(null);

    // Client-side SHA-256 demo: immediately compute hash via SubtleCrypto
    try {
      setIsHashing(true);
      const hash = await computeSHA256(file);
      setClientHash(hash);
    } catch (err) {
      console.error('Failed to compute client-side SHA-256:', err);
      setErrorMessage('Could not compute client-side SHA-256 hash.');
    } finally {
      setIsHashing(false);
    }
  };

  const handleIssueSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMessage('Please select a PDF document first.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      const result = await issueDocument(selectedFile);
      setIssuanceResult(result);
    } catch (err) {
      setErrorMessage(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setClientHash(null);
    setIssuanceResult(null);
    setErrorMessage(null);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Title & Introduction */}
      <div className="mb-8 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-medium mb-3">
          <FilePlus className="w-3.5 h-3.5" />
          <span>Issuer Portal • NIST P-256 Stamping</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Issue & Stamp Document
        </h1>
        <p className="mt-2 text-sm sm:text-base text-slate-400">
          Cryptographically sign official documents with ECDSA P-256, anchor in the Merkle log, and append a verification QR stamp.
        </p>
      </div>

      {/* Main Content: Result or Form */}
      {issuanceResult ? (
        <div className="space-y-6">
          <IssuanceResult data={issuanceResult} onReset={handleReset} />
        </div>
      ) : (
        <form onSubmit={handleIssueSubmit} className="space-y-6">
          {/* File Upload Area */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2">
                Select PDF Document to Certify
              </label>
              <FileUploader
                onFileSelect={handleFileSelect}
                selectedFile={selectedFile}
                disabled={isSubmitting}
                label="Upload Official Document to Sign & Stamp"
              />
            </div>

            {/* Client-side SHA-256 Demo Box */}
            {selectedFile && (
              <div className="p-4 sm:p-5 rounded-xl bg-slate-950/90 border border-emerald-500/30 space-y-2 animate-in fade-in duration-300">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                  <div className="flex items-center gap-2 text-emerald-400 font-semibold uppercase tracking-wider">
                    <Cpu className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Client-Side SHA-256 Fingerprint</span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-emerald-400" /> Web Crypto SubtleCrypto API
                  </span>
                </div>

                {isHashing ? (
                  <div className="flex items-center gap-2 text-sm text-slate-400 py-2">
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                    <span>Computing cryptographic digest in browser memory...</span>
                  </div>
                ) : clientHash ? (
                  <div className="space-y-1.5 pt-1">
                    <code className="block p-2.5 rounded-lg bg-slate-900 font-mono text-xs sm:text-sm text-emerald-400 border border-slate-800/80 break-all select-all font-medium">
                      {clientHash}
                    </code>
                    <p className="text-xs text-slate-400 flex items-center gap-1.5 pt-0.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      Client-side fingerprint (computed in your browser — file never leaves your device until you submit)
                    </p>
                  </div>
                ) : null}
              </div>
            )}

            {/* Error Message */}
            {errorMessage && (
              <div className="p-4 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-red-200">Issuance Failed</p>
                  <p className="text-xs text-red-300/90">{errorMessage}</p>
                </div>
              </div>
            )}

            {/* Submit Action */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-800/80">
              <div className="text-xs text-slate-500 flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                <span>ECDSA signature and QR code will be embedded in stamped output</span>
              </div>

              <button
                type="submit"
                disabled={!selectedFile || isSubmitting || isHashing}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Signing & Stamping Document...</span>
                  </>
                ) : (
                  <>
                    <FilePlus className="w-4 h-4" />
                    <span>Issue & Stamp Document</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};
