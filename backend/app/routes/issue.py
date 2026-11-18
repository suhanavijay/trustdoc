import uuid
import json
import base64
from datetime import datetime, timezone
import fitz
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session

from app.config import settings
from app.db.database import get_db
from app.db.models import Document
from app.schemas.schemas import IssueResponse
from app.crypto.hashing import compute_sha256
from app.crypto.signing import load_or_create_institution_key, sign_data
from app.crypto.merkle import load_merkle_state, save_merkle_state
from app.pdf.stamper import stamp_pdf, get_page_count

router = APIRouter(prefix="/api/v1", tags=["issue"])


@router.post(
    "/issue",
    response_model=IssueResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Issue and stamp a new document",
)
async def issue_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    # 1. Validate file extension or content type
    filename = file.filename or "document.pdf"
    content_type = file.content_type or ""
    if not (filename.lower().endswith(".pdf") or "pdf" in content_type.lower() or content_type == "application/octet-stream"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file must be a valid PDF document.",
        )

    # Read original file bytes
    try:
        pdf_bytes = await file.read()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to read uploaded file: {str(e)}",
        )

    if not pdf_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded PDF file is empty.",
        )

    # Validate PDF structure with fitz
    try:
        test_doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        if len(test_doc) == 0:
            test_doc.close()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="PDF file contains no pages.",
            )
        test_doc.close()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid or corrupted PDF file: {str(e)}",
        )

    # 2. Generate UUID4 as document_id
    document_id = str(uuid.uuid4())

    # 3. Load institution key pair
    institution_name = "TrustDoc Demo Institution"
    priv_pem, pub_pem = load_or_create_institution_key(settings.KEYS_DIR, institution_name)

    # 4. Build verification URL
    verification_url = f"{settings.BASE_URL.rstrip('/')}/verify/{document_id}"

    # 5. Compute SHA-256 of ORIGINAL pdf bytes, sign it with ECDSA
    orig_digest = compute_sha256(pdf_bytes)
    initial_signature = sign_data(orig_digest.encode("utf-8"), priv_pem)

    # 6. Stamp the PDF: add QR code + inject metadata
    try:
        stamped_pdf_bytes = stamp_pdf(
            pdf_bytes=pdf_bytes,
            document_id=document_id,
            signature=initial_signature,
            verification_url=verification_url,
            issuer_name=institution_name,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to stamp PDF: {str(e)}",
        )

    # 7. Compute SHA-256 of the STAMPED pdf bytes — canonical digest
    stamped_digest = compute_sha256(stamped_pdf_bytes)

    # 8. Sign the STAMPED digest (this replaces the pre-stamp signature)
    final_signature = sign_data(stamped_digest.encode("utf-8"), priv_pem)

    # 9. Load Merkle tree from state, add stamped digest as leaf, save state
    try:
        tree = load_merkle_state(settings.MERKLE_STATE_FILE)
        leaf_index = tree.add_leaf(stamped_digest)
        merkle_root = tree.get_root()
        merkle_proof = tree.get_proof(leaf_index)
        save_merkle_state(tree, settings.MERKLE_STATE_FILE)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update Merkle tree state: {str(e)}",
        )

    # 10. Store document record in DB with stamped digest, final signature, Merkle info
    page_count = get_page_count(stamped_pdf_bytes)
    issued_at = datetime.now(timezone.utc)

    doc_record = Document(
        id=document_id,
        sha256_digest=stamped_digest,
        signature=final_signature,
        issuer_name=institution_name,
        issuer_public_key=pub_pem.decode("utf-8"),
        merkle_root=merkle_root,
        merkle_proof=json.dumps(merkle_proof),
        merkle_leaf_index=leaf_index,
        issued_at=issued_at,
        revoked=False,
        original_filename=filename,
        page_count=page_count,
    )

    try:
        db.add(doc_record)
        db.commit()
        db.refresh(doc_record)
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save document record: {str(e)}",
        )

    # 11. Return IssueResponse with base64-encoded stamped PDF
    stamped_pdf_b64 = base64.b64encode(stamped_pdf_bytes).decode("utf-8")

    return IssueResponse(
        document_id=doc_record.id,
        sha256_digest=doc_record.sha256_digest,
        signature=doc_record.signature,
        issuer_name=doc_record.issuer_name,
        merkle_root=doc_record.merkle_root,
        merkle_leaf_index=doc_record.merkle_leaf_index,
        issued_at=doc_record.issued_at,
        verification_url=verification_url,
        stamped_pdf_b64=stamped_pdf_b64,
    )
