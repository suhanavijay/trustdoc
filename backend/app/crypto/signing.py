import os
import re
import base64
from typing import Tuple
from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.exceptions import InvalidSignature


def generate_key_pair() -> Tuple[bytes, bytes]:
    """Generates an ECDSA P-256 (SECP256R1) key pair returning (private_key_pem, public_key_pem)."""
    private_key = ec.generate_private_key(ec.SECP256R1())
    private_pem = private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.NoEncryption(),
    )
    public_key = private_key.public_key()
    public_pem = public_key.public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo,
    )
    return private_pem, public_pem


def sign_data(data: bytes, private_key_pem: bytes) -> str:
    """Signs data using ECDSA P-256 with SHA-256 and returns a base64-encoded DER signature string."""
    private_key = serialization.load_pem_private_key(private_key_pem, password=None)
    if not isinstance(private_key, ec.EllipticCurvePrivateKey):
        raise ValueError("Provided key is not an EllipticCurvePrivateKey")
    signature = private_key.sign(data, ec.ECDSA(hashes.SHA256()))
    return base64.b64encode(signature).decode("utf-8")


def verify_signature(data: bytes, signature_b64: str, public_key_pem: bytes) -> bool:
    """Verifies an ECDSA P-256 signature against public key PEM and data. Returns True if valid, False otherwise (never raises)."""
    try:
        public_key = serialization.load_pem_public_key(public_key_pem)
        if not isinstance(public_key, ec.EllipticCurvePublicKey):
            return False
        sig_bytes = base64.b64decode(signature_b64)
        public_key.verify(sig_bytes, data, ec.ECDSA(hashes.SHA256()))
        return True
    except (InvalidSignature, ValueError, Exception):
        return False


def load_or_create_institution_key(keys_dir: str, institution_name: str) -> Tuple[bytes, bytes]:
    """Loads an institution key pair from disk or generates and saves a new one."""
    os.makedirs(keys_dir, exist_ok=True)
    sanitized_name = re.sub(r"[^a-zA-Z0-9_-]", "_", institution_name.lower().strip())
    private_key_path = os.path.join(keys_dir, f"{sanitized_name}_private.pem")
    public_key_path = os.path.join(keys_dir, f"{sanitized_name}_public.pem")

    if os.path.exists(private_key_path) and os.path.exists(public_key_path):
        with open(private_key_path, "rb") as f:
            priv_pem = f.read()
        with open(public_key_path, "rb") as f:
            pub_pem = f.read()
        return priv_pem, pub_pem

    priv_pem, pub_pem = generate_key_pair()
    with open(private_key_path, "wb") as f:
        f.write(priv_pem)
    with open(public_key_path, "wb") as f:
        f.write(pub_pem)

    return priv_pem, pub_pem
