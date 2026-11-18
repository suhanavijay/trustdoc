import os
from pathlib import Path


class Settings:
    # Project paths
    APP_DIR: str = os.path.dirname(os.path.abspath(__file__))
    BACKEND_DIR: str = os.path.dirname(APP_DIR)
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./trustdoc.db")
    
    # URLs
    BASE_URL: str = os.getenv("BASE_URL", "http://localhost:5173")
    API_URL: str = os.getenv("API_URL", "http://localhost:8000")
    
    # Keys directory
    KEYS_DIR: str = os.getenv("KEYS_DIR", os.path.join(BACKEND_DIR, "keys"))
    
    # Merkle tree state file (in app directory as specified)
    MERKLE_STATE_FILE: str = os.getenv(
        "MERKLE_STATE_FILE", os.path.join(APP_DIR, "merkle_state.json")
    )


settings = Settings()
