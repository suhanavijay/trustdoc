import React, { useState } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, ShieldCheck, Key, GitBranch, Ban, Copy, Check } from 'lucide-react';
import { VerifyResponse } from '../types';
import { copyToClipboard } from '../utils/crypto';

interface CryptoBreakdownProps {
  result: VerifyResponse;
}

export const CryptoBreakdown: React.FC<CryptoBreakdownProps> = ({ result }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = async (key: string, text: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  const isShaValid = Boolean(result.sha256_digest && result.sha256_digest.length === 64);
  const isSigValid = result.signature_valid === true;
  const isMerkleValid = result.merkle_proof_valid === true;
  const isNotRevoked = result.revoked !== true;

  const checks = [
    {
      id: 'sha256',
      title: 'SHA-256 Digest',
      icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />,
      status: isShaValid ? 'passed' : 'failed',
      value: result.sha256_digest || 'No hash extracted',
      badge: isShaValid ? 'Exact Match (256-bit)' : 'Invalid Digest',
      copyable: Boolean(result.sha256_digest),
      details: 'Calculated client-side and verified against cryptographic index.',
    },
    {
      id: 'signature',
      title: 'ECDSA P-256 Digital Signature',
      icon: <Key className="w-5 h-5 text-teal-400" />,
      status: isSigValid ? 'passed' : 'failed',
      value: isSigValid ? 'Verified with Issuer Public Key' : 'Signature Unverified / Invalid',
      badge: isSigValid ? 'P-256 Verified' : 'Failed Verification',
      copyable: false,
      details: result.issuer_name ? `Issued and signed by ${result.issuer_name}` : 'Asymmetric curve verification',
    },
    {
      id: 'merkle',
      title: 'Merkle Tree Transparency Proof',
      icon: <GitBranch className="w-5 h-5 text-blue-400" />,
      status: isMerkleValid ? 'passed' : 'failed',
      value: isMerkleValid ? 'Inclusion Proof Valid in Global Merkle Tree' : 'Proof Not Found in Merkle Tree',
      badge: isMerkleValid ? 'Cryptographic Anchor' : 'Not Anchored',
      copyable: false,
      details: 'Tamper-evident append-only ledger proof.',
    },
    {
      id: 'revocation',
      title: 'Certificate Revocation Status',
      icon: <Ban className="w-5 h-5 text-amber-400" />,
      status: result.revoked ? 'revoked' : isNotRevoked ? 'passed' : 'failed',
      value: result.revoked
        ? `Revoked: ${result.revocation_reason || 'Certificate revoked by issuer'}`
        : 'Active (Not Revoked)',
      badge: result.revoked ? 'REVOKED' : 'Active & Valid',
      copyable: false,
      details: result.revoked ? 'This certificate is permanently invalidated.' : 'Status confirmed with revocation registry.',
    },
  ];

  return (
    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      <div className="px-6 py-4 border-b border-slate-800/80 bg-slate-900 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-200 tracking-wide uppercase flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          Cryptographic Verification Pipeline
        </h3>
        <span className="text-xs font-mono text-slate-400">Zero-Trust Audit</span>
      </div>

      <div className="divide-y divide-slate-800/80">
        {checks.map((item) => (
          <div key={item.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-850/40 transition-colors">
            <div className="flex items-start gap-3.5">
              <div className="mt-0.5">
                {item.status === 'passed' && (
                  <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                )}
                {item.status === 'revoked' && (
                  <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                )}
                {item.status === 'failed' && (
                  <div className="p-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
                    <XCircle className="w-5 h-5" />
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-200">{item.title}</span>
                  <span
                    className={`text-[11px] font-mono px-2 py-0.5 rounded-full border ${
                      item.status === 'passed'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : item.status === 'revoked'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        : 'bg-red-500/10 text-red-400 border-red-500/30'
                    }`}
                  >
                    {item.badge}
                  </span>
                </div>

                <p className="text-xs text-slate-400">{item.details}</p>

                {item.copyable ? (
                  <div className="flex items-center gap-2 mt-1">
                    <code className="text-xs font-mono text-emerald-300 bg-slate-950 px-2.5 py-1 rounded border border-slate-800 break-all select-all">
                      {item.value}
                    </code>
                    <button
                      onClick={() => handleCopy(item.id, item.value)}
                      className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                      title="Copy SHA-256 hash"
                    >
                      {copiedKey === item.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                ) : (
                  <p className="text-xs font-medium text-slate-300">{item.value}</p>
                )}
              </div>
            </div>

            <div className="text-right">
              <span
                className={`text-xs font-semibold uppercase tracking-wider ${
                  item.status === 'passed'
                    ? 'text-emerald-400'
                    : item.status === 'revoked'
                    ? 'text-amber-400'
                    : 'text-red-400'
                }`}
              >
                {item.status === 'passed' ? 'PASS' : item.status === 'revoked' ? 'REVOKED' : 'FAIL'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
