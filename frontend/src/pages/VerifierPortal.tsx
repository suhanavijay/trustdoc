import React, { useState } from 'react';
import {
  FileCheck2,
  ShieldCheck,
  Loader2,
  Lock,
  Cpu,
  Sparkles,
  AlertCircle,
  Search,
  FileText,
} from 'lucide-react';
import { FileUploader } from '../components/FileUploader';
import { VerificationResult } from '../components/VerificationResult';
import { computeSHA256 } from '../utils/crypto';
import { verifyDocument, verifyDocumentById, getErrorMessage } from '../api/client';
import { VerifyResponse } from '../types';

export const VerifierPortal: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'upload' | 'id'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [clientHash, setClientHash] = useState<string | null>(null);
  const [isHashing, setIsHashing] = useState<boolean>(false);
  const [documentIdInput, setDocumentIdInput] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verificationResult, setVerificationResult] = useState<VerifyResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileSelect = async (file: File) => {
    setSelectedFile(file);
    setErrorMessage(null);
    setVerificationResult(null);
    setClientHash(null);

    // Compute client-side SHA-256 immediately
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

  const handleVerifyFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMessage('Please select a PDF document first.');
      return;
    }

    try {
      setIsVerifying(true);
      setErrorMessage(null);
      const res = await verifyDocument(selectedFile);
      setVerificationResult(res);
    } catch (err) {
      setErrorMessage(getErrorMessage(err));
    } finally {
      setIsVerifying(false);
    }
  };

  const handleVerifyById = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedId = documentIdInput.trim();
    if (!trimmedId) {
      setErrorMessage('Please enter a valid Document ID.');
      return;
    }

    try {
      setIsVerifying(true);
      setErrorMessage(null);
      const res = await verifyDocumentById(trimmedId);
      setVerificationResult(res);
    } catch (err) {
      setErrorMessage(getErrorMessage(err));
    } finally {
      setIsVerifying(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setClientHash(null);
    setVerificationResult(null);
    setErrorMessage(null);
    setDocumentIdInput('');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Title & Subtitle */}
      <div className="mb-8 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-mono font-medium mb-3">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Public Verifier • Zero-Login Access</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Verify Document
        </h1>
        <p className="mt-2 text-sm sm:text-base text-slate-400">
          Zero-login verification — drop any document to check its authenticity and detect modifications.
        </p>
      </div>

      {/* Main View: Result or Submission */}
      {verificationResult ? (
        <div className="space-y-6">
          <VerificationResult
            result={verificationResult}
            onReset={handleReset}
            onRefresh={async () => {
              if (selectedFile) {
                try {
                  setIsVerifying(true);
                  const res = await verifyDocument(selectedFile);
                  setVerificationResult(res);
                } catch (err) {
                  setErrorMessage(getErrorMessage(err));
                } finally {
                  setIsVerifying(false);
                }
              } else if (verificationResult.document_id) {
                try {
                  setIsVerifying(true);
                  const res = await verifyDocumentById(verificationResult.document_id);
                  setVerificationResult(res);
                } catch (err) {
                  setErrorMessage(getErrorMessage(err));
                } finally {
                  setIsVerifying(false);
                }
              }
            }}
          />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Tabs: File Upload vs Document ID Lookup */}
          <div className="flex border-b border-slate-800">
            <button
              onClick={() => {
                setActiveTab('upload');
                setErrorMessage(null);
              }}
              className={`pb-3 px-4 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${
                activeTab === 'upload'
                  ? 'border-emerald-400 text-emerald-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Verify by File Upload</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('id');
                setErrorMessage(null);
              }}
              className={`pb-3 px-4 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${
                activeTab === 'id'
                  ? 'border-emerald-400 text-emerald-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>Verify by Document ID</span>
            </button>
          </div>

          {/* Tab 1: Upload PDF */}
          {activeTab === 'upload' ? (
            <form onSubmit={handleVerifyFile} className="space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-200 mb-2">
                    Drag & Drop File to Verify
                  </label>
                  <FileUploader
                    onFileSelect={handleFileSelect}
                    selectedFile={selectedFile}
                    disabled={isVerifying}
                    label="Drop document to verify authenticity"
                  />
                </div>

                {/* Client-side SHA-256 Demo */}
                {selectedFile && (
                  <div className="p-4 sm:p-5 rounded-xl bg-slate-950/90 border border-teal-500/30 space-y-2 animate-in fade-in duration-300">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                      <div className="flex items-center gap-2 text-teal-400 font-semibold uppercase tracking-wider">
                        <Cpu className="w-4 h-4 text-teal-400 shrink-0" />
                        <span>Client-Side SHA-256 Fingerprint</span>
                      </div>
                      <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                        <Lock className="w-3 h-3 text-teal-400" /> Web Crypto SubtleCrypto API
                      </span>
                    </div>

                    {isHashing ? (
                      <div className="flex items-center gap-2 text-sm text-slate-400 py-2">
                        <Loader2 className="w-4 h-4 animate-spin text-teal-400" />
                        <span>Hashing file in browser memory...</span>
                      </div>
                    ) : clientHash ? (
                      <div className="space-y-1.5 pt-1">
                        <code className="block p-2.5 rounded-lg bg-slate-900 font-mono text-xs sm:text-sm text-teal-300 border border-slate-800/80 break-all select-all font-medium">
                          {clientHash}
                        </code>
                        <p className="text-xs text-slate-400 flex items-center gap-1.5 pt-0.5">
                          <Sparkles className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                          Client-side fingerprint (computed in your browser — file never leaves your device until you submit)
                        </p>
                      </div>
                    ) : null}
                  </div>
                )}

                {/* Error Banner */}
                {errorMessage && (
                  <div className="p-4 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-red-200">Verification Request Error</p>
                      <p className="text-xs text-red-300/90">{errorMessage}</p>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={!selectedFile || isVerifying || isHashing}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold shadow-lg shadow-teal-500/20 hover:shadow-teal-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isVerifying ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                        <span>Verifying Cryptographic Proof...</span>
                      </>
                    ) : (
                      <>
                        <FileCheck2 className="w-4 h-4" />
                        <span>Verify Document Authenticity</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          ) : (
            /* Tab 2: Lookup by Document UUID */
            <form onSubmit={handleVerifyById} className="space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-200 mb-2">
                    Enter Document ID (UUID)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={documentIdInput}
                      onChange={(e) => setDocumentIdInput(e.target.value)}
                      placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 font-mono text-sm focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400"
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-2">
                    Lookup official certificate records anchored directly in the Merkle log registry.
                  </p>
                </div>

                {/* Error Banner */}
                {errorMessage && (
                  <div className="p-4 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-red-200">Lookup Error</p>
                      <p className="text-xs text-red-300/90">{errorMessage}</p>
                    </div>
                  </div>
                )}

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={!documentIdInput.trim() || isVerifying}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold shadow-lg shadow-teal-500/20 hover:shadow-teal-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isVerifying ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                        <span>Querying Registry...</span>
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4" />
                        <span>Lookup Certificate</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
};
