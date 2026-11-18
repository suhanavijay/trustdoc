from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, Integer, DateTime, Boolean
from app.db.database import Base


def _utc_now():
    return datetime.now(timezone.utc)


class Document(Base):
    __tablename__ = "documents"

    id = Column(String, primary_key=True)  # UUID
    sha256_digest = Column(String(64), nullable=False, index=True, unique=True)
    signature = Column(Text, nullable=False)  # base64 ECDSA sig
    issuer_name = Column(String, nullable=False)
    issuer_public_key = Column(Text, nullable=False)  # PEM
    merkle_root = Column(String(64), nullable=True)
    merkle_proof = Column(Text, nullable=True)  # JSON string
    merkle_leaf_index = Column(Integer, nullable=True)
    issued_at = Column(DateTime, default=_utc_now)
    revoked = Column(Boolean, default=False)
    revoked_at = Column(DateTime, nullable=True)
    revocation_reason = Column(String, nullable=True)
    original_filename = Column(String, nullable=True)
    page_count = Column(Integer, nullable=True)
