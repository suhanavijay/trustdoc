from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class IssueResponse(BaseModel):
    document_id: str
    sha256_digest: str
    signature: str
    issuer_name: str
    merkle_root: Optional[str] = None
    merkle_leaf_index: Optional[int] = None
    issued_at: datetime
    verification_url: str
    stamped_pdf_b64: str

    model_config = ConfigDict(from_attributes=True)


class VerifyResponse(BaseModel):
    is_valid: bool
    document_id: Optional[str] = None
    sha256_digest: Optional[str] = None
    signature_valid: Optional[bool] = None
    merkle_proof_valid: Optional[bool] = None
    issuer_name: Optional[str] = None
    issued_at: Optional[datetime] = None
    revoked: Optional[bool] = None
    revocation_reason: Optional[str] = None
    message: str

    model_config = ConfigDict(from_attributes=True)


class VerifyByIdResponse(BaseModel):
    is_valid: bool
    document_id: str
    sha256_digest: str
    signature_valid: Optional[bool] = None
    merkle_proof_valid: Optional[bool] = None
    issuer_name: Optional[str] = None
    issued_at: Optional[datetime] = None
    revoked: bool = False
    revoked_at: Optional[datetime] = None
    revocation_reason: Optional[str] = None
    original_filename: Optional[str] = None
    page_count: Optional[int] = None
    message: str

    model_config = ConfigDict(from_attributes=True)


class RevokeRequest(BaseModel):
    document_id: str
    reason: Optional[str] = "Document revoked by issuer"


class RevokeResponse(BaseModel):
    success: bool
    message: str


class DocumentInfo(BaseModel):
    id: str
    sha256_digest: str
    signature: str
    issuer_name: str
    issuer_public_key: str
    merkle_root: Optional[str] = None
    merkle_leaf_index: Optional[int] = None
    issued_at: datetime
    revoked: bool = False
    revoked_at: Optional[datetime] = None
    revocation_reason: Optional[str] = None
    original_filename: Optional[str] = None
    page_count: Optional[int] = None

    model_config = ConfigDict(from_attributes=True)
