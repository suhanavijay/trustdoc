import React from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  Fingerprint,
  KeyRound,
  GitBranch,
  QrCode,
  ArrowRight,
  FileCheck2,
  FilePlus,
  ShieldCheck,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="relative overflow-hidden">
      {/* Background glowing gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-emerald-500/10 via-teal-500/5 to-transparent pointer-events-none blur-3xl -z-10" />

      {/* Hero Section */}
      <section className="pt-20 pb-16 md:pt-28 md:pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        {/* Top pill badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-medium mb-8 shadow-inner">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Zero-Trust Cryptographic Document Proof</span>
        </div>

        {/* Brand & Tagline */}
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-xl shadow-emerald-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Shield className="w-8 h-8 text-emerald-400" />
            </div>
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white">
            Trust<span className="text-emerald-400">Doc</span>
          </h1>
        </div>

        <p className="text-xl sm:text-2xl font-semibold text-slate-200 mb-4 max-w-3xl mx-auto">
          Cryptographic Document Verification System
        </p>

        <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed">
          Generate tamper-proof digital fingerprints for official documents.
          Detect unauthorized modifications instantly with asymmetric ECDSA signatures and Merkle transparency trees.
        </p>

        {/* Two Large CTA Cards Side by Side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto text-left">
          {/* Card 1: Issue Documents */}
          <Link
            to="/issue"
            className="group relative p-8 rounded-3xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/50 shadow-xl hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-300 flex flex-col justify-between"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-bl-full pointer-events-none group-hover:bg-emerald-500/20 transition-all" />
            <div>
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 transition-transform">
                <FilePlus className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors flex items-center gap-2">
                Issue Documents
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Stamp and sign official documents with cryptographic proof. Computes SHA-256 in your browser,
                applies an ECDSA P-256 digital signature, and embeds a QR verification anchor.
              </p>
            </div>
            <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold group-hover:translate-x-1.5 transition-transform">
              <span>Start Issuance Portal</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>

          {/* Card 2: Verify Documents */}
          <Link
            to="/verify"
            className="group relative p-8 rounded-3xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-teal-500/50 shadow-xl hover:shadow-2xl hover:shadow-teal-500/10 transition-all duration-300 flex flex-col justify-between"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-bl-full pointer-events-none group-hover:bg-teal-500/20 transition-all" />
            <div>
              <div className="w-14 h-14 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 mb-6 group-hover:scale-110 transition-transform">
                <FileCheck2 className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-teal-400 transition-colors flex items-center gap-2">
                Verify Documents
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Upload any document to verify its authenticity instantly. Zero-login required.
                Inspect cryptographic breakdown and detect even a single bit of tampering.
              </p>
            </div>
            <div className="flex items-center gap-2 text-teal-400 text-sm font-semibold group-hover:translate-x-1.5 transition-transform">
              <span>Launch Verifier Portal</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-800/80">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            Cryptographic Integrity Stack
          </h2>
          <p className="mt-4 text-slate-400 text-base">
            Every verified document relies on military-grade asymmetric cryptography, transparent Merkle trees, and irreversible hashing.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Feature 1 */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-5">
              <Fingerprint className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-white mb-2">SHA-256 Fingerprinting</h4>
            <p className="text-sm text-slate-400 leading-relaxed">
              Every document is mapped to a 256-bit collision-resistant hash. The hash is computed client-side using Web Crypto APIs.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all">
            <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 mb-5">
              <KeyRound className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-white mb-2">ECDSA P-256 Signatures</h4>
            <p className="text-sm text-slate-400 leading-relaxed">
              Issuers sign document digests with Elliptic Curve Digital Signature Algorithm (NIST P-256 curve) ensuring non-repudiation.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-5">
              <GitBranch className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-white mb-2">Merkle Transparency</h4>
            <p className="text-sm text-slate-400 leading-relaxed">
              Issued credentials are chronologically sequenced into an immutable Merkle Tree ledger for verifiable audit trails.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-5">
              <QrCode className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-white mb-2">QR Code Verification</h4>
            <p className="text-sm text-slate-400 leading-relaxed">
              Stamped documents carry an on-page QR code linking directly to public verification, enabling instant smartphone validation.
            </p>
          </div>
        </div>
      </section>

      {/* How it Works / Workflow Walkthrough */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 sm:p-12">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h3 className="text-2xl sm:text-3xl font-bold text-white">
              Zero-Trust Verification Architecture
            </h3>
            <p className="mt-2 text-slate-400 text-sm">
              How TrustDoc guarantees document integrity without storing unencrypted sensitive files.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400 font-mono font-bold text-lg">
                01
              </div>
              <h5 className="text-base font-bold text-white">Client-Side Digest</h5>
              <p className="text-xs text-slate-400 leading-relaxed">
                Browser reads file bytes and computes SHA-256 locally via SubtleCrypto before network transmission.
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-teal-400 font-mono font-bold text-lg">
                02
              </div>
              <h5 className="text-base font-bold text-white">Cryptographic Stamping</h5>
              <p className="text-xs text-slate-400 leading-relaxed">
                Issuer signs the digest with private key, seals it in the Merkle Tree, and stamps a verification QR code into the PDF.
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-blue-400 font-mono font-bold text-lg">
                03
              </div>
              <h5 className="text-base font-bold text-white">Public Verification</h5>
              <p className="text-xs text-slate-400 leading-relaxed">
                Anyone can drag-and-drop the PDF or scan the QR code to verify the signature and detect unauthorized changes.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
