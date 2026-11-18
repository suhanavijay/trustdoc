from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import Document
from app.schemas.schemas import RevokeRequest, RevokeResponse

router = APIRouter(prefix="/api/v1", tags=["revoke"])


@router.post(
    "/revoke",
    response_model=RevokeResponse,
    summary="Revoke an existing document",
)
def revoke_document(
    payload: RevokeRequest,
    db: Session = Depends(get_db),
):
    doc = db.query(Document).filter(Document.id == payload.document_id).first()
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document with ID '{payload.document_id}' not found.",
        )

    if doc.revoked:
        return RevokeResponse(
            success=True,
            message="Document is already revoked.",
        )

    doc.revoked = True
    doc.revoked_at = datetime.now(timezone.utc)
    doc.revocation_reason = payload.reason or "Revoked by issuer"

    try:
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to revoke document: {str(e)}",
        )

    return RevokeResponse(
        success=True,
        message=f"Document '{payload.document_id}' successfully revoked.",
    )
