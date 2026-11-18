# TrustDoc — Cryptographic Document Verification System

> Generate tamper-proof digital fingerprints for official documents. Detect unauthorized modifications instantly.

## 🏗️ Architecture

```
┌──────────────────┐    ┌──────────────────────┐    ┌────────────────────┐
│  React Frontend  │───▶│  FastAPI Backend      │───▶│  Cryptographic     │
│  (Port 5173)     │    │  (Port 8000)          │    │  Engine            │
│                  │    │                       │    │                    │
│  • Issuer Dash   │    │  POST /api/v1/issue   │    │  • SHA-256 Hash    │
│  • Verifier      │    │  POST /api/v1/verify  │    │  • ECDSA P-256     │
│  • QR Verify     │    │  GET  /api/v1/verify/ │    │  • Merkle Tree     │
│                  │    │  POST /api/v1/revoke  │    │  • PDF QR Stamper  │
└──────────────────┘    └──────────────────────┘    └────────────────────┘
                                   │
                        ┌──────────▼──────────┐
                        │   SQLite Ledger     │
                        │   (Zero-Knowledge)  │
                        │   No raw PDFs stored│
                        └─────────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- pip & npm

### 1. Start the Backend

```bash
cd backend
pip install -r requirements.txt
python run.py
```

Backend runs at **http://localhost:8000** — API docs at **/docs**

### 2. Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at **http://localhost:5173**

## 🔐 Core Features

### Cryptographic Engine
- **SHA-256 Fingerprinting** — Deterministic 64-character hex digest of document bytes
- **ECDSA P-256 Digital Signatures** — NIST-approved elliptic curve signing (SECP256R1)
- **RFC 9162 Merkle Tree** — Domain-separated binary tree with `0x00` leaf / `0x01` internal node prefixes
- **Two-Phase PDF Stamping** — QR code + metadata injection *before* final hash computation

### Zero-Knowledge Storage
Raw PDF files are **never** stored in the database. Only the cryptographic digest, digital signature, issuer metadata, and timestamp are retained — eliminating privacy and GDPR liabilities.

### Two-Phase PDF Stamping
1. Generate unique UUID for the document
2. Render QR code (linking to verification URL) on the last page
3. Inject digital signature into PDF metadata
4. Compute final SHA-256 on the **stamped** output

This avoids the classic trap of hashing *before* adding the QR code, which would invalidate the hash.

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/issue` | Upload PDF → stamp → sign → return stamped PDF |
| `POST` | `/api/v1/verify` | Upload PDF → compute hash → verify against registry |
| `GET` | `/api/v1/verify/{id}` | Look up document by ID (QR code flow) |
| `POST` | `/api/v1/revoke` | Revoke a previously issued document |
| `GET` | `/api/v1/health` | Health check |

## 🖥️ Frontend

### Issuer Dashboard (`/issue`)
- Upload PDF via drag-and-drop
- Client-side SHA-256 preview using browser's `SubtleCrypto` API
- Download cryptographically stamped PDF
- View document ID, digest, signature, Merkle root

### Public Verifier Portal (`/verify`)
- Zero-login drag-and-drop verification
- Real-time cryptographic breakdown (hash match, signature, Merkle proof, revocation)
- Green ✓ VERIFIED / Red ✗ NOT VERIFIED / Amber ⚠ REVOKED status

### QR Code Verification (`/verify/:id`)
- Scan the QR code on a stamped document
- Instant verification without file upload

## 🧪 Demo Scenario

1. **Issue** — Upload a university degree PDF → get stamped version with QR code
2. **Verify** — Upload the stamped PDF → see green "VERIFIED" with full crypto breakdown
3. **Tamper** — Modify the CGPA in the PDF → upload again → instant red "NOT VERIFIED"
4. **Revoke** — Revoke the original document → previously valid PDF now shows "REVOKED"

## 📁 Project Structure

```
trustdoc/
├── backend/
│   ├── requirements.txt
│   ├── run.py
│   └── app/
│       ├── main.py          # FastAPI app + CORS + lifespan
│       ├── config.py         # Settings (DB, URLs, paths)
│       ├── crypto/
│       │   ├── hashing.py    # SHA-256 fingerprinting
│       │   ├── signing.py    # ECDSA P-256 sign/verify
│       │   └── merkle.py     # RFC 9162 Merkle tree
│       ├── pdf/
│       │   └── stamper.py    # Two-phase QR + metadata stamping
│       ├── db/
│       │   ├── database.py   # SQLAlchemy + SQLite
│       │   └── models.py     # Document model
│       ├── schemas/
│       │   └── schemas.py    # Pydantic request/response models
│       └── routes/
│           ├── issue.py      # POST /api/v1/issue
│           ├── verify.py     # POST + GET /api/v1/verify
│           └── revoke.py     # POST /api/v1/revoke
└── frontend/
    ├── package.json
    ├── vite.config.ts        # Proxy /api → localhost:8000
    └── src/
        ├── App.tsx           # React Router setup
        ├── api/client.ts     # Axios API client
        ├── utils/crypto.ts   # SubtleCrypto SHA-256
        ├── pages/
        │   ├── LandingPage.tsx
        │   ├── IssuerDashboard.tsx
        │   ├── VerifierPortal.tsx
        │   └── VerifyById.tsx
        └── components/
            ├── Navbar.tsx
            ├── FileUploader.tsx
            ├── IssuanceResult.tsx
            ├── VerificationResult.tsx
            ├── CryptoBreakdown.tsx
            └── Footer.tsx
```

## 🛡️ Security Design

- **Domain-separated Merkle hashing** prevents second-preimage attacks (RFC 9162)
- **Odd leaf promotion** (never duplicate) prevents Merkle tree forgery
- **ECDSA P-256** ensures an attacker cannot forge signatures without the private key
- **Zero-knowledge storage** means even a full DB breach reveals no document content
- **Two-phase stamping** ensures the QR code is part of the verified document

---

**Built for DeCODE Crafters Hackathon** | SHA-256 · ECDSA P-256 · Merkle Trees · FastAPI · React
