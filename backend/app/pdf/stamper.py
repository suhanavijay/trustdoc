import io
import re
from datetime import datetime, timezone
from typing import Optional, Dict, Any
import fitz
import qrcode


def _escape_pdf_str(value: str) -> str:
    """Escapes special characters for PDF string literal (val)."""
    escaped = value.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")
    return f"({escaped})"


def get_page_count(pdf_bytes: bytes) -> int:
    """Returns the total number of pages in the PDF."""
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    count = len(doc)
    doc.close()
    return count


def stamp_pdf(
    pdf_bytes: bytes,
    document_id: str,
    signature: str,
    verification_url: str,
    issuer_name: str,
) -> bytes:
    """
    Two-phase PDF stamping using PyMuPDF:
    1. Opens PDF from bytes
    2. Inserts a QR code encoding verification_url on the last page bottom-right corner
       with a label "Scan to verify | TrustDoc"
    3. Injects custom metadata into the PDF Info dictionary:
       trustdoc_id, trustdoc_signature, trustdoc_issuer, trustdoc_timestamp
    4. Returns stamped PDF bytes.
    """
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    if len(doc) == 0:
        raise ValueError("Cannot stamp an empty PDF document")

    # Target last page
    page = doc[-1]
    rect = page.rect

    # Generate QR Code
    qr = qrcode.QRCode(
        version=None,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=4,
        border=1,
    )
    qr.add_data(verification_url)
    qr.make(fit=True)
    qr_img = qr.make_image(fill_color="black", back_color="white")

    img_buffer = io.BytesIO()
    qr_img.save(img_buffer, format="PNG")
    qr_bytes = img_buffer.getvalue()

    # Determine placement in bottom-right corner
    qr_size = 90.0
    margin = 25.0
    qr_x0 = max(0.0, rect.width - qr_size - margin)
    qr_y0 = max(0.0, rect.height - qr_size - margin - 15.0)
    qr_x1 = max(qr_x0 + 10.0, qr_x0 + qr_size)
    qr_y1 = max(qr_y0 + 10.0, qr_y0 + qr_size)

    qr_rect = fitz.Rect(qr_x0, qr_y0, qr_x1, qr_y1)
    page.insert_image(qr_rect, stream=qr_bytes)

    # Insert text label below QR code
    text_point = fitz.Point(qr_x0, qr_y1 + 10.0)
    try:
        page.insert_text(
            text_point,
            "Scan to verify | TrustDoc",
            fontsize=7,
            fontname="helv",
            color=(0.2, 0.2, 0.2),
        )
    except Exception:
        # Fallback without font specifications
        page.insert_text(text_point, "Scan to verify | TrustDoc", fontsize=7)

    # Ensure document has an Info dict in trailer
    meta = doc.metadata or {}
    meta["producer"] = "TrustDoc Cryptographic Verifier"
    doc.set_metadata(meta)

    # Inject custom keys into PDF Info dictionary
    trailer = doc.pdf_trailer()
    match = re.search(r"/Info\s+(\d+)\s+0\s+R", trailer)
    timestamp_str = datetime.now(timezone.utc).isoformat()

    if match:
        info_xref = int(match.group(1))
        doc.xref_set_key(info_xref, "trustdoc_id", _escape_pdf_str(document_id))
        doc.xref_set_key(info_xref, "trustdoc_signature", _escape_pdf_str(signature))
        doc.xref_set_key(info_xref, "trustdoc_issuer", _escape_pdf_str(issuer_name))
        doc.xref_set_key(info_xref, "trustdoc_timestamp", _escape_pdf_str(timestamp_str))

    stamped_bytes = doc.tobytes(deflate=True)
    doc.close()
    return stamped_bytes


def extract_metadata(pdf_bytes: bytes) -> Optional[Dict[str, Any]]:
    """
    Extracts TrustDoc metadata from PDF if present.
    Returns dict with keys: trustdoc_id, trustdoc_signature, trustdoc_issuer, trustdoc_timestamp
    or None if not found.
    """
    try:
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        trailer = doc.pdf_trailer()
        match = re.search(r"/Info\s+(\d+)\s+0\s+R", trailer)
        if not match:
            doc.close()
            return None

        info_xref = int(match.group(1))
        res: Dict[str, Any] = {}
        for key in ["trustdoc_id", "trustdoc_signature", "trustdoc_issuer", "trustdoc_timestamp"]:
            val_tuple = doc.xref_get_key(info_xref, key)
            if val_tuple and len(val_tuple) == 2 and val_tuple[0] == "string":
                res[key] = val_tuple[1]

        doc.close()
        return res if res else None
    except Exception:
        return None
