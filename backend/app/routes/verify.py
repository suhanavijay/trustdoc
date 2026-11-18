import json
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import Document
from app.schemas.schemas import VerifyResponse, VerifyByIdResponse
from app.crypto.hashing import compute_sha256
from app.crypto.signing import verify_signature
from app.crypto.merkle import MerkleTree

router = APIRouter(prefix="/api/v1", tags=["verify"])


@router.post(
    "/verify",
    response_model=VerifyResponse,
    summary="Verify document authenticity via uploaded file",
)
async def verify_document_file(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    try:
        content = await file.read()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to read file: {str(e)}",
        )

    if not content:
        return VerifyResponse(
            is_valid=False,
            message="Uploaded file is empty.",
        )

    digest = compute_sha256(content)

    # Look up digest in DB
    doc = db.query(Document).filter(Document.sha256_digest == digest).first()
    if not doc:
        return VerifyResponse(
            is_valid=False,
            sha256_digest=digest,
            message="Document not found in registry",
        )

    # Verify ECDSA signature
    sig_valid = verify_signature(
        data=doc.sha256_digest.encode("utf-8"),
        signature_b64=doc.signature,
        public_key_pem=doc.issuer_public_key.encode("utf-8"),
    )

    # Verify Merkle proof
    merkle_valid: bool = False
    if doc.merkle_proof and doc.merkle_root:
        try:
            proof = json.loads(doc.merkle_proof)
            merkle_valid = MerkleTree.verify_proof(doc.sha256_digest, proof, doc.merkle_root)
        except Exception:
            merkle_valid = False
    elif not doc.merkle_root:
        merkle_valid = True

    is_revoked = bool(doc.revoked)
    is_valid = sig_valid and merkle_valid and not is_revoked

    if is_revoked:
        msg = f"Document is revoked. Reason: {doc.revocation_reason or 'No reason provided'}"
    elif not sig_valid:
        msg = "Cryptographic signature is invalid or tampered"
    elif not merkle_valid:
        msg = "Merkle inclusion proof verification failed"
    else:
        msg = "Document is authentic and verified"

    return VerifyResponse(
        is_valid=is_valid,
        document_id=doc.id,
        sha256_digest=doc.sha256_digest,
        signature_valid=sig_valid,
        merkle_proof_valid=merkle_valid,
        issuer_name=doc.issuer_name,
        issued_at=doc.issued_at,
        revoked=doc.revoked,
        revocation_reason=doc.revocation_reason,
        message=msg,
    )


@router.get(
    "/verify/{document_id}",
    response_model=VerifyByIdResponse,
    summary="Get verification details by document ID",
)
def verify_document_by_id(
    document_id: str,
    db: Session = Depends(get_db),
):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document with ID '{document_id}' not found.",
        )

    # Verify signature
    sig_valid = verify_signature(
        data=doc.sha256_digest.encode("utf-8"),
        signature_b64=doc.signature,
        public_key_pem=doc.issuer_public_key.encode("utf-8"),
    )

    # Verify Merkle proof
    merkle_valid: bool = False
    if doc.merkle_proof and doc.merkle_root:
        try:
            proof = json.loads(doc.merkle_proof)
            merkle_valid = MerkleTree.verify_proof(doc.sha256_digest, proof, doc.merkle_root)
        except Exception:
            merkle_valid = False
    elif not doc.merkle_root:
        merkle_valid = True

    is_revoked = bool(doc.revoked)
    is_valid = sig_valid and merkle_valid and not is_revoked

    if is_revoked:
        msg = f"Document is revoked. Reason: {doc.revocation_reason or 'No reason specified'}"
    elif not sig_valid:
        msg = "Cryptographic signature is invalid"
    elif not merkle_valid:
        msg = "Merkle tree proof verification failed"
    else:
        msg = "Document is verified and valid"

    return VerifyByIdResponse(
        is_valid=is_valid,
        document_id=doc.id,
        sha256_digest=doc.sha256_digest,
        signature_valid=sig_valid,
        merkle_proof_valid=merkle_valid,
        issuer_name=doc.issuer_name,
        issued_at=doc.issued_at,
        revoked=doc.revoked,
        revoked_at=doc.revoked_at,
        revocation_reason=doc.revocation_reason,
        original_filename=doc.original_filename,
        page_count=doc.page_count,
        message=msg,
    )
