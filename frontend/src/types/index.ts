export interface IssueResponse {
  document_id: string;        // UUID
  sha256_digest: string;      // 64-char hex
  signature: string;          // base64 ECDSA sig
  issuer_name: string;
  merkle_root: string;        // 64-char hex
  merkle_leaf_index: number;
  issued_at: string;          // ISO datetime
  verification_url: string;   // URL for QR
  stamped_pdf_b64: string;    // base64-encoded stamped PDF
}

export interface VerifyResponse {
  is_valid: boolean;
  document_id?: string;
  sha256_digest: string;
  signature_valid?: boolean;
  merkle_proof_valid?: boolean;
  issuer_name?: string;
  issued_at?: string;
  revoked?: boolean;
  revocation_reason?: string;
  message: string;
}

export interface RevokeRequest {
  document_id: string;
  reason: string;
}

export interface RevokeResponse {
  success: boolean;
  message: string;
}

export interface ClientFileDetails {
  file: File;
  name: string;
  size: number;
  sha256: string;
  computedAt: Date;
}
