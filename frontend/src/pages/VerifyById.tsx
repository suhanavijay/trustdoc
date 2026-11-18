import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ShieldCheck,
  Loader2,
  AlertCircle,
  ArrowLeft,
  Upload,
} from 'lucide-react';
import { VerificationResult } from '../components/VerificationResult';
import { verifyDocumentById, getErrorMessage } from '../api/client';
import { VerifyResponse } from '../types';

export const VerifyById: React.FC = () => {
  const { documentId } = useParams<{ documentId: string }>();
  const [result, setResult] = useState<VerifyResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchVerification = useCallback(async () => {
    if (!documentId) {
      setErrorMessage('Missing Document ID in verification route.');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage(null);
      const data = await verifyDocumentById(documentId);
      setResult(data);
    } catch (err) {
      setErrorMessage(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [documentId]);

  useEffect(() => {
    fetchVerification();
  }, [fetchVerification]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Top Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-medium mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>QR Verification Endpoint</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Document Identity Audit
          </h1>
          <p className="text-xs sm:text-sm font-mono text-slate-400 mt-1">
            Auditing ID: <span className="text-emerald-400">{documentId}</span>
          </p>
        </div>

        <Link
          to="/verify"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors self-start sm:self-auto"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Upload File Instead</span>
        </Link>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-4 shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-400">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
          <h3 className="text-lg font-bold text-white">
            Querying Cryptographic Ledger
          </h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Retrieving document fingerprint, verifying ECDSA P-256 signature, and auditing Merkle tree inclusion...
          </p>
        </div>
      )}

      {/* Error State */}
      {!isLoading && errorMessage && (
        <div className="bg-slate-900 border border-red-500/30 rounded-2xl p-8 text-center space-y-6 shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto text-red-400">
            <AlertCircle className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-bold text-white">
              Verification Failed or Not Found
            </h3>
            <p className="text-sm text-red-300 max-w-md mx-auto">
              {errorMessage}
            </p>
            <p className="text-xs text-slate-500 font-mono">
              Target ID: {documentId}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={fetchVerification}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium border border-slate-700 transition-colors"
            >
              Retry Check
            </button>
            <Link
              to="/verify"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-sm transition-colors"
            >
              <Upload className="w-4 h-4" />
              <span>Verify by File Upload</span>
            </Link>
          </div>
        </div>
      )}

      {/* Result Display */}
      {!isLoading && result && (
        <VerificationResult
          result={result}
          onRefresh={fetchVerification}
        />
      )}
    </div>
  );
};
