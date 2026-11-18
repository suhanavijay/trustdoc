import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Shield,
  Calendar,
  Building,
  RefreshCw,
  Ban,
  Loader2,
  Copy,
  Check,
} from 'lucide-react';
import { VerifyResponse } from '../types';
import { CryptoBreakdown } from './CryptoBreakdown';
import { revokeDocument } from '../api/client';
import { copyToClipboard } from '../utils/crypto';

interface VerificationResultProps {
  result: VerifyResponse;
  onReset?: () => void;
  onRefresh?: () => void;
}

export const VerificationResult: React.FC<VerificationResultProps> = ({
  result: initialResult,
  onReset,
  onRefresh,
}) => {
  const [result, setResult] = useState<VerifyResponse>(initialResult);
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [revokeReason, setRevokeReason] = useState('');
  const [isRevoking, setIsRevoking] = useState(false);
  const [revokeError, setRevokeError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  // Sync state if initialResult prop changes
  React.useEffect(() => {
    setResult(initialResult);
  }, [initialResult]);

  const isValid = result.is_valid && !result.revoked;
  const isRevoked = result.revoked === true;
  const isTampered = !result.is_valid && !result.revoked;

  const handleCopyId = async () => {
    if (result.document_id) {
      await copyToClipboard(result.document_id);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const handleRevokeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!result.document_id) return;
    if (!revokeReason.trim()) {
      setRevokeError('Please provide a reason for revocation.');
      return;
    }

    try {
      setIsRevoking(true);
      setRevokeError(null);
      await revokeDocument({
        document_id: result.document_id,
        reason: revokeReason.trim(),
      });
      // Update local state to immediately show revoked status
      setResult((prev) => ({
        ...prev,
        revoked: true,
        revocation_reason: revokeReason.trim(),
        message: `Revoked: ${revokeReason.trim()}`,
      }));
      setShowRevokeModal(false);
      setRevokeReason('');
    } catch (err) {
      setRevokeError(err instanceof Error ? err.message : 'Failed to revoke document');
    } finally {
      setIsRevoking(false);
    }
  };

  const formatDate = (isoStr?: string) => {
    if (!isoStr) return 'N/A';
    try {
      return new Date(isoStr).toLocaleString();
    } catch {
      return isoStr;
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Primary Status Banner */}
      {isValid && (
        <div className="bg-emerald-950/40 border-2 border-emerald-500/50 rounded-2xl p-6 sm:p-8 text-emerald-300 shadow-2xl shadow-emerald-500/10 transition-all">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                    VERIFIED
                  </span>
                  <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400">✓</span>
                </div>
                <p className="text-sm text-emerald-200/90 mt-1 font-medium">
                  Document is authentic, cryptographically intact, and unhampered.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
              <span className="px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-mono font-bold tracking-wider uppercase">
                Integrity Validated
              </span>
            </div>
          </div>
        </div>
      )}

      {isRevoked && (
        <div className="bg-amber-950/40 border-2 border-amber-500/50 rounded-2xl p-6 sm:p-8 text-amber-300 shadow-2xl shadow-amber-500/10 transition-all">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 shadow-lg shadow-amber-500/20">
                <AlertTriangle className="w-9 h-9" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                    REVOKED
                  </span>
                  <span className="text-2xl sm:text-3xl font-extrabold text-amber-400">⚠</span>
                </div>
                <p className="text-sm text-amber-200/90 mt-1 font-medium">
                  {result.revocation_reason
                    ? `Revocation Reason: ${result.revocation_reason}`
                    : 'This document was revoked by the issuer and is no longer officially valid.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
              <span className="px-3.5 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-mono font-bold tracking-wider uppercase">
                Certificate Revoked
              </span>
            </div>
          </div>
        </div>
      )}

      {isTampered && (
        <div className="bg-red-950/40 border-2 border-red-500/50 rounded-2xl p-6 sm:p-8 text-red-300 shadow-2xl shadow-red-500/10 transition-all">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 shrink-0 shadow-lg shadow-red-500/20">
                <XCircle className="w-9 h-9" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                    NOT VERIFIED
                  </span>
                  <span className="text-2xl sm:text-3xl font-extrabold text-red-400">✗</span>
                </div>
                <p className="text-sm text-red-200/90 mt-1 font-medium">
                  {result.message || 'Tamper detected! No matching cryptographic signature found for this file.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
              <span className="px-3.5 py-1.5 rounded-full bg-red-500/20 border border-red-400/40 text-red-300 text-xs font-mono font-bold tracking-wider uppercase">
                Tamper Detected
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Metadata Card if Document is recognized */}
      {result.document_id && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-400" /> Document ID
              </span>
              <div className="flex items-center gap-2">
                <code className="text-xs font-mono text-slate-200 truncate max-w-[200px]">
                  {result.document_id}
                </code>
                <button
                  onClick={handleCopyId}
                  className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
                  title="Copy Document ID"
                >
                  {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-teal-400" /> Official Issuer
              </span>
              <p className="text-sm font-medium text-slate-200">
                {result.issuer_name || 'Verified Authority'}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-400" /> Registered Date
              </span>
              <p className="text-sm font-medium text-slate-200">
                {formatDate(result.issued_at)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Cryptographic Proof Breakdown */}
      <CryptoBreakdown result={result} />

      {/* Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
        <div className="flex items-center gap-3">
          {onReset && (
            <button
              onClick={onReset}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium border border-slate-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Verify Another Document</span>
            </button>
          )}

          {onRefresh && (
            <button
              onClick={onRefresh}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium border border-slate-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Re-check Status</span>
            </button>
          )}
        </div>

        {/* Demo Revoke Button: for testing document revocation */}
        {result.document_id && !result.revoked && (
          <div>
            <button
              onClick={() => setShowRevokeModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-sm font-medium transition-colors"
            >
              <Ban className="w-4 h-4" />
              <span>Revoke Document (Issuer Demo)</span>
            </button>
          </div>
        )}
      </div>

      {/* Revocation Modal */}
      {showRevokeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-amber-400">
              <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Revoke Document</h3>
            </div>

            <p className="text-sm text-slate-300">
              Revoking this document will permanently record its invalidation in the verification
              registry. Any future verifications will trigger a <strong className="text-amber-400">REVOKED</strong> alert.
            </p>

            <form onSubmit={handleRevokeSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Reason for Revocation *
                </label>
                <textarea
                  value={revokeReason}
                  onChange={(e) => setRevokeReason(e.target.value)}
                  placeholder="e.g., Certificate superseded, fraudulent issuance, expired license..."
                  rows={3}
                  className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                  required
                />
              </div>

              {revokeError && (
                <p className="text-xs text-red-400 bg-red-950/50 p-2.5 rounded-lg border border-red-800">
                  {revokeError}
                </p>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRevokeModal(false)}
                  disabled={isRevoking}
                  className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isRevoking || !revokeReason.trim()}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-sm transition-all disabled:opacity-50"
                >
                  {isRevoking ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Revoking...</span>
                    </>
                  ) : (
                    <span>Confirm Revocation</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
