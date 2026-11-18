import os
import json
import hashlib
from typing import List, Dict, Any, Optional


def _hash_leaf_bytes(data: bytes) -> bytes:
    """RFC 9162 domain-separated leaf hash: SHA256(0x00 || leaf_data)"""
    return hashlib.sha256(b"\x00" + data).digest()


def _hash_internal_bytes(left: bytes, right: bytes) -> bytes:
    """RFC 9162 domain-separated internal node hash: SHA256(0x01 || left || right)"""
    return hashlib.sha256(b"\x01" + left + right).digest()


def _to_bytes(data_hex: str) -> bytes:
    """Convert hex string to bytes, or fallback to utf-8 encoding."""
    try:
        return bytes.fromhex(data_hex)
    except (ValueError, TypeError):
        return data_hex.encode("utf-8")


class MerkleTree:
    """
    RFC 9162 compliant binary Merkle tree with domain separation:
    - Leaves: SHA256(0x00 || leaf_data)
    - Internal nodes: SHA256(0x01 || left || right)
    - Odd leaf counts are handled by promoting the unpaired node to the next level (never duplicating).
    """

    def __init__(self, leaves: Optional[List[str]] = None) -> None:
        # self.leaves stores the hex digests of the leaf hashes
        self.leaves: List[str] = list(leaves) if leaves is not None else []

    def add_leaf(self, data_hex: str) -> int:
        """
        Appends the leaf hash of data_hex to the tree and returns its index.
        """
        raw_bytes = _to_bytes(data_hex)
        leaf_hash = _hash_leaf_bytes(raw_bytes).hex()
        self.leaves.append(leaf_hash)
        return len(self.leaves) - 1

    def _build_levels(self) -> List[List[bytes]]:
        """
        Builds the tree layers from bottom to top.
        Odd counts are promoted to the next level.
        """
        if not self.leaves:
            return []

        current_level: List[bytes] = [bytes.fromhex(h) for h in self.leaves]
        levels: List[List[bytes]] = [current_level]

        while len(current_level) > 1:
            next_level: List[bytes] = []
            for i in range(0, len(current_level), 2):
                if i + 1 < len(current_level):
                    parent = _hash_internal_bytes(current_level[i], current_level[i + 1])
                    next_level.append(parent)
                else:
                    # Odd node: promote to next level without duplicating
                    next_level.append(current_level[i])
            current_level = next_level
            levels.append(current_level)

        return levels

    def get_root(self) -> str:
        """Computes and returns the Merkle root hex string."""
        if not self.leaves:
            return ""
        levels = self._build_levels()
        return levels[-1][0].hex()

    def get_proof(self, leaf_index: int) -> List[Dict[str, str]]:
        """
        Returns the audit proof for leaf_index as a list of:
        [{"hash": <hex_str>, "direction": "left" | "right"}, ...]
        """
        if leaf_index < 0 or leaf_index >= len(self.leaves):
            raise IndexError(f"Leaf index {leaf_index} out of range (total leaves: {len(self.leaves)})")

        levels = self._build_levels()
        if len(levels) <= 1:
            # Single leaf or empty tree -> empty proof
            return []

        proof: List[Dict[str, str]] = []
        idx = leaf_index

        for level in levels[:-1]:
            if idx % 2 == 0:
                # Even index: sibling is on the right if it exists
                if idx + 1 < len(level):
                    proof.append({
                        "hash": level[idx + 1].hex(),
                        "direction": "right",
                    })
                # If idx + 1 >= len(level), node was promoted, so no sibling at this level
            else:
                # Odd index: sibling is on the left
                proof.append({
                    "hash": level[idx - 1].hex(),
                    "direction": "left",
                })
            idx = idx // 2

        return proof

    @staticmethod
    def verify_proof(leaf_hex: str, proof: List[Dict[str, str]], root_hex: str) -> bool:
        """
        Verifies that leaf_hex is part of the Merkle tree with root root_hex using proof.
        Returns True if valid, False otherwise (never raises).
        """
        if not leaf_hex or not root_hex:
            return False

        def _fold(initial_node: bytes) -> str:
            curr = initial_node
            for step in proof:
                sib_bytes = bytes.fromhex(step["hash"])
                direction = step.get("direction", "").lower()
                if direction == "left":
                    curr = _hash_internal_bytes(sib_bytes, curr)
                elif direction == "right":
                    curr = _hash_internal_bytes(curr, sib_bytes)
                else:
                    raise ValueError(f"Unknown direction: {direction}")
            return curr.hex()

        try:
            # First attempt: leaf_hex is the raw data (stamped document digest), so hash it with 0x00
            leaf_node = _hash_leaf_bytes(_to_bytes(leaf_hex))
            if _fold(leaf_node).lower() == root_hex.lower():
                return True

            # Second attempt: leaf_hex might already be the leaf hash
            try:
                raw_node = bytes.fromhex(leaf_hex)
                if _fold(raw_node).lower() == root_hex.lower():
                    return True
            except ValueError:
                pass

            return False
        except Exception:
            return False

    def to_dict(self) -> Dict[str, Any]:
        """Serializes the tree state to a dict."""
        return {"leaves": list(self.leaves)}

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "MerkleTree":
        """Deserializes tree from dict."""
        return cls(leaves=data.get("leaves", []))


def load_merkle_state(filepath: str) -> MerkleTree:
    """Loads MerkleTree from JSON file or returns empty MerkleTree if file does not exist."""
    if os.path.exists(filepath):
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                data = json.load(f)
            return MerkleTree.from_dict(data)
        except Exception:
            return MerkleTree()
    return MerkleTree()


def save_merkle_state(tree: MerkleTree, filepath: str) -> None:
    """Saves MerkleTree state to JSON file safely using atomic replace."""
    os.makedirs(os.path.dirname(os.path.abspath(filepath)), exist_ok=True)
    temp_path = f"{filepath}.tmp"
    with open(temp_path, "w", encoding="utf-8") as f:
        json.dump(tree.to_dict(), f, indent=2)
    os.replace(temp_path, filepath)
