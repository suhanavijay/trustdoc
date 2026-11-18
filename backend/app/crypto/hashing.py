import hashlib
from typing import Union
from pathlib import Path


def compute_sha256(data: bytes) -> str:
    """Computes and returns the lowercase 64-character SHA-256 hex digest of the given bytes."""
    return hashlib.sha256(data).hexdigest().lower()


def compute_file_sha256(file_path: Union[str, Path], chunk_size: int = 65536) -> str:
    """Reads a file in chunks and returns its lowercase 64-character SHA-256 hex digest."""
    hasher = hashlib.sha256()
    with open(file_path, "rb") as f:
        while True:
            chunk = f.read(chunk_size)
            if not chunk:
                break
            hasher.update(chunk)
    return hasher.hexdigest().lower()
