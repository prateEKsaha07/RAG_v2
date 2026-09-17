# Backend Dependency Optimization Guide

A complete playbook for auditing, trimming, and speeding up any Python backend, plus a reusable reference file you can keep in every project.

---

## Table of Contents

1. The Problem
2. The Full Playbook (Step-by-Step)
3. Real Example - RAG_v2 Backend
4. Reference Cheat Sheet
5. Common Pitfalls and Gotchas
6. Template Files You Can Copy

---

## 1. The Problem

Python backends bloat over time. Every `pip install` of an experimental library, every copy-pasted tutorial, every "let me just try this" adds up. Symptoms:

- Slow cold starts (2 to 5+ seconds to accept requests)
- Huge `venv` folder (2 to 5 GB)
- Unmanageable `requirements.txt` (100+ lines, nobody knows what half are)
- Conflict hell - versions fight each other in CI
- Onboarding pain - new devs can't tell what's needed

Root cause: Python has no built-in "what am I actually using?" tool. `pip freeze` shows everything installed, including transitives. It doesn't distinguish between "I need this" and "this got pulled in by something I need."

---

## 2. The Full Playbook

### Phase 1 - Investigate (5 min)

```powershell
# 1. Snapshot current state
pip list

# 2. Count packages
pip list | Measure-Object | Select-Object -ExpandProperty Count

# 3. See venv size
"{0:N2} GB" -f ((Get-ChildItem -Recurse venv | Measure-Object -Property Length -Sum).Sum / 1GB)

# 4. Backup before touching anything
python -c "import subprocess; open('requirements-backup.txt','w',encoding='utf-8',newline='\n').write(subprocess.check_output(['pip','freeze']).decode())"
```

### Phase 2 - Find what's actually imported (5 min)

```powershell
# Install the scanner
pip install pipreqs

# Run against your code folder (adjust path)
pipreqs app --force --savepath requirements-actual.txt

# See the truth
Get-Content requirements-actual.txt
```

What you get: only the top-level packages your code actually imports.

### Phase 3 - Safety check every candidate

For each package you want to remove:

```powershell
pip show <package-name>
```

Look at the `Required-by:` field:

| Field value | Action |
|---|---|
| Non-empty (e.g., `Required-by: langchain-core`) | KEEP - something needs it |
| Empty | Safe to remove |

Batch safety check script:

```powershell
$candidates = @("torch","transformers","jupyter_client","google-genai","ollama")
foreach ($p in $candidates) {
    $info = pip show $p 2>$null
    if (-not $info) { Write-Host "$p - NOT INSTALLED" -ForegroundColor Gray; continue }
    $req = ($info | Select-String "^Required-by:").Line -replace "Required-by:\s*",""
    if ([string]::IsNullOrWhiteSpace($req)) {
        Write-Host "$p - SAFE to remove" -ForegroundColor Green
    } else {
        Write-Host "$p - KEEP (required by: $req)" -ForegroundColor Yellow
    }
}
```

### Phase 4 - Remove in safe stages

```powershell
pip uninstall -y <package-1> <package-2> ...
```

After each stage, test:

```powershell
python -c "from app.main import app; print('OK')"
```

If it errors, reinstall the missing one and note it in `requirements.txt`.

### Phase 5 - Rebuild `requirements.txt` as top-level only

Open `requirements.txt` and replace contents with just your top-level deps (from Phase 2, filtered through Phase 3).

### Phase 6 - Verify fresh install works

This is critical. Never skip.

```powershell
python -m venv venv-verify
.\venv-verify\Scripts\Activate.ps1
pip install -r requirements.txt
python -c "from app.main import app; print('Clean install works!')"
deactivate
Remove-Item -Recurse -Force venv-verify
```

If it prints OK, commit. If it errors, add the missing package to `requirements.txt` and retest.

### Phase 7 - Lazy-load heavy imports in code

This is the biggest win. Move heavy work from module-level to `lifespan` or endpoint functions.

Before:

```python
from langchain_cohere import ChatCohere
import torch
from supabase import create_client

llm = ChatCohere(...)          # runs at import
model = torch.load("model.pt") # runs at import
supabase = create_client(...)  # runs at import

app = FastAPI()
```

After:

```python
from contextlib import asynccontextmanager
from fastapi import FastAPI

llm = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global llm
    from langchain_cohere import ChatCohere
    llm = ChatCohere(...)
    yield

app = FastAPI(lifespan=lifespan)

@app.get("/health")
def health():
    return {"ready": llm is not None}
```

### Phase 8 - Fix encoding and gitignore issues

```powershell
# Ensure requirements.txt is UTF-8 without BOM
$content = Get-Content requirements.txt -Raw
[System.IO.File]::WriteAllText("$PWD\requirements.txt", $content, [System.Text.UTF8Encoding]::new($false))

# Add .gitattributes to prevent future binary diffs
@"
* text=auto
requirements.txt text eol=lf
*.py text eol=lf
*.md text eol=lf
"@ | Set-Content .gitattributes -Encoding utf8

# Add .gitignore rules
@"

# Requirements variants - only the real one gets tracked
requirements-*.txt
!requirements.txt
"@ | Add-Content .gitignore
```

### Phase 9 - Measure the win

```powershell
# Boot time
Measure-Command { python -c "from app.main import app" } | Select-Object TotalSeconds

# HTTP cold response (server running)
Measure-Command { Invoke-WebRequest http://127.0.0.1:8000/ -UseBasicParsing } | Select-Object TotalSeconds

# Package count
pip list | Measure-Object | Select-Object -ExpandProperty Count

# Venv size
"{0:N2} GB" -f ((Get-ChildItem -Recurse venv | Measure-Object -Property Length -Sum).Sum / 1GB)
```

### Phase 10 - Commit and deploy

```powershell
git add requirements.txt app/main.py .gitignore .gitattributes
git commit -m "perf: lazy-load heavy imports, trim deps to top-level"
git push
```

Watch the deploy. If it fails with `ModuleNotFoundError: X`, add `X` to `requirements.txt`, commit, push.

---

## 3. Real Example - RAG_v2 Backend

### Before

| Metric | Value |
|---|---|
| Packages installed | 180 |
| `requirements.txt` lines | 180 |
| Venv size | ~3.5 GB |
| Cold HTTP response | 2 to 4 seconds |
| Health endpoint | None |
| Encoding | UTF-16 with BOM |

### After

| Metric | Value |
|---|---|
| Packages installed | 111 (auto-resolved) |
| `requirements.txt` lines | 17 top-level |
| Venv size | ~500 MB |
| Cold HTTP response | 56 ms |
| Health endpoint | Working |
| Encoding | UTF-8 (clean) |

### What was removed

Heavy ML (unused):
`torch`, `transformers`, `sentence-transformers`, `scikit-learn`, `scipy`, `sympy`, `networkx`, `safetensors`, `tokenizers`, `huggingface_hub`, `hf-xet`

Jupyter and IPython:
`ipython`, `jupyter_client`, `jupyter_core`, `nbconvert`, `nbformat`, `nbclient`, `pyzmq`, `tornado`, `traitlets`, `prompt_toolkit`, `parso`, `jedi`, `pickleshare`, `asttokens`, `executing`, `stack-data`, `pure_eval`, `wcwidth`, `matplotlib-inline`, `Pygments`, `decorator`, `bleach`, `tinycss2`, `webencodings`, `defusedxml`, `mistune`, `pandocfilters`, `fastjsonschema`

Dev tooling:
`pipreqs`, `yarg`, `docopt`, `deptry`, `requirements-parser`, `mypy_extensions`, `types-PyYAML`, `types-requests`

Duplicate LLM SDKs:
`google-genai`, `google-generativeai`, `google-ai-generativelanguage`, `google-api-python-client`, `ollama`, `langgraph`, `langgraph-checkpoint`, `langgraph-prebuilt`, `langgraph-sdk`, `langchain-google-genai`, `langchain-huggingface`, `langchain-ollama`, `langchain-classic`, `langchain-protocol`

Kept after errors surfaced:
`langsmith` (needed by langchain-core), `cohere` (needed by langchain-cohere), `faiss-cpu` (needed by langchain-community)

### The lazy-load refactor

Before (`main.py`):

```python
from app.modules.Quiz.quiz import generate_quiz      # ~300ms
from langchain_cohere import ChatCohere              # ~400ms
from langchain_community.vectorstores import FAISS   # ~300ms

embeddings = CohereEmbeddings(...)                   # ~300ms
vectorStoreDB = FAISS.load_local(...)                # ~500ms to 2s
llm = ChatCohere(...)                                # ~300ms

app = FastAPI()
```

After:

```python
from fastapi import FastAPI, Depends
from pydantic import BaseModel

embeddings = None
vectorStoreDB = None
llm = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global embeddings, vectorStoreDB, llm
    from langchain_cohere import CohereEmbeddings, ChatCohere
    from langchain_community.vectorstores import FAISS

    embeddings = CohereEmbeddings(...)
    vectorStoreDB = FAISS.load_local(...)
    llm = ChatCohere(...)
    yield

app = FastAPI(lifespan=lifespan)

@app.get("/health")
def health():
    return {"status": "ok", "ready": vectorStoreDB is not None}

@app.post("/ask")
def ask_endpoint(request: AskRequest, user=Depends(get_current_user)):
    from app.modules.Qa.query import get_answer
    return get_answer(request.question, llm, vectorStoreDB, user.id, embeddings)
```

Result: server accepts connections in about 50 ms instead of waiting 2 to 4 seconds for heavy init.

---

## 4. Reference Cheat Sheet

### Commands you'll use

```powershell
# INVESTIGATE
pip list                                    # everything installed
pip freeze                                  # same, pip-installable format
pip show <pkg>                              # metadata and Required-by
pip check                                   # broken deps?
python -X importtime -c "import module" 2> imports.log   # per-module load time

# FIND UNUSED
pipreqs app --force --savepath actual.txt   # top-level imports only
pip-extra-reqs app                          # unused top-level
deptry app                                  # modern replacement (needs pyproject.toml)

# SAFETY CHECK
pip show <pkg> | Select-String "Required-by:"
# Empty = safe to remove | Non-empty = keep

# FIX ENCODING (Windows)
$c = Get-Content requirements.txt -Raw
[System.IO.File]::WriteAllText("$PWD\requirements.txt", $c, [System.Text.UTF8Encoding]::new($false))

# MEASURE
Measure-Command { python -c "from app.main import app" }
Measure-Command { Invoke-WebRequest http://127.0.0.1:8000/ -UseBasicParsing }

# CLEAN ENV TEST
python -m venv venv-test
.\venv-test\Scripts\Activate.ps1
pip install -r requirements.txt
python -c "from app.main import app; print('OK')"
deactivate
Remove-Item -Recurse -Force venv-test
```

### `pip show` field meanings

| Field | Meaning |
|---|---|
| `Requires:` | What this package needs (its deps) |
| `Required-by:` | What needs this package (its dependents) |
| `Location:` | Where it's installed |
| `Version:` | Installed version |

### Encoding BOM detection

```powershell
Format-Hex requirements.txt | Select-Object -First 1
```

| First bytes | Encoding | Verdict |
|---|---|---|
| `EF BB BF` | UTF-8 with BOM | Strip it |
| `FF FE` | UTF-16 LE | Fix it |
| `FE FF` | UTF-16 BE | Fix it |
| Letters | UTF-8 no BOM | Good |

---

## 5. Common Pitfalls and Gotchas

### Pitfall 1 - "Unused" doesn't mean "removable"

`deptry` and `pipreqs` only scan your code. They can't see that `langchain_community` silently needs `faiss-cpu`.

Mitigation: Always test in a fresh venv before pushing to production.

### Pitfall 2 - The "works on my machine" trap

Your local venv has leftover packages from earlier installs. `requirements.txt` may not declare them. Fresh install reveals the truth.

Mitigation: Fresh-venv test after every `requirements.txt` change.

### Pitfall 3 - Silent langchain integrations

`langchain_community` has dozens of optional integrations. Each requires a package not listed as a hard dep:

| Import | Missing dep |
|---|---|
| `langchain_community.vectorstores.FAISS` | `faiss-cpu` |
| `langchain_community.vectorstores.Chroma` | `chromadb` |
| `langchain_community.vectorstores.Qdrant` | `qdrant-client` |
| `langchain_community.document_loaders.PyPDFLoader` | `pypdf` |
| `langchain_community.embeddings.HuggingFaceEmbeddings` | `sentence-transformers` |
| `langchain_community.chat_models.ChatOpenAI` | `openai` |

Mitigation: Grep your code for `from langchain_community.*` and add the matching package.

### Pitfall 4 - Transitive imports at module top-level

```python
# This forces faiss to load at import time
from langchain_community.vectorstores import FAISS
vectorStoreDB = FAISS.load_local(...)
```

Even if you only use FAISS in one endpoint, this runs at import. Move it into `lifespan` or the function.

### Pitfall 5 - UTF-16 `requirements.txt` on Windows

`pip freeze > requirements.txt` in PowerShell 5.1 writes UTF-16, which `pip` can't always parse.

Fix: Use Python's `subprocess` (see Phase 1) or upgrade to PowerShell 7.

### Pitfall 6 - Removing version pins

Switching from pinned (`fastapi==0.141.1`) to unpinned (`fastapi`) means future installs might break.

Fix: For production, use `pip-compile` to generate a lock file:

```bash
pip install pip-tools
pip-compile requirements.in --output-file requirements.txt
```

Keep `requirements.in` as your human-readable list.

### Pitfall 7 - Git showing "7700 files changed"

VSCode and git count every file in `venv/` if it's not gitignored.

Fix: Add to `.gitignore`:

```gitignore
venv/
venv-*/
.venv/
env/
__pycache__/
```

The `venv-*/` pattern catches `venv-verify`, `venv-test`, etc.

---

## 6. Template Files

### `requirements.txt` (top-level only)

```txt
# ==============================================
# Top-level dependencies only.
# Transitive deps are resolved automatically by pip.
# ==============================================

# ---------- Core framework ----------
fastapi
uvicorn[standard]
pydantic
pydantic-settings
python-dotenv
python-multipart
PyJWT

# ---------- Database / Auth ----------
supabase

# ---------- LangChain + Cohere ----------
langchain
langchain-core
langchain-community
langchain-cohere
langchain-text-splitters
faiss-cpu

# ---------- Document parsing ----------
beautifulsoup4
pymupdf

# ---------- HTTP ----------
requests
```

### `.gitignore` (Python backend)

```gitignore
# ============ Environment ============
.env
.env.local
.env.*.local

# ============ Python ============
__pycache__/
*.py[cod]
*$py.class
*.so
*.egg-info/
.eggs/
dist/
build/
.pytest_cache/
.mypy_cache/
.coverage
htmlcov/

# ============ Virtual Envs ============
venv/
venv-*/
.venv/
.venv-*/
env/
ENV/

# ============ IDE ============
.vscode/
.idea/
*.swp
*.swo

# ============ OS ============
.DS_Store
Thumbs.db
desktop.ini

# ============ Requirements variants ============
requirements-*.txt
!requirements.txt

# ============ App-generated ============
faiss_index/
analytics/*.json
data/uploads/*
!data/uploads/.gitkeep
```

### `.gitattributes`

```
* text=auto
requirements.txt text eol=lf
*.py text eol=lf
*.md text eol=lf
```

### `app/main.py` lifespan template

```python
from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends
from pydantic import BaseModel

from app.core.auth import get_current_user

embeddings = None
vectorStoreDB = None
llm = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global embeddings, vectorStoreDB, llm

    from langchain_cohere import CohereEmbeddings, ChatCohere
    from langchain_community.vectorstores import FAISS
    import os

    embeddings = CohereEmbeddings(
        model="embed-english-light-v3.0",
        cohere_api_key=os.getenv("COHERE_API_KEY"),
    )
    vectorStoreDB = FAISS.load_local(
        "faiss_index", embeddings,
        allow_dangerous_deserialization=True,
    )
    llm = ChatCohere(model="command-r7b-12-2024")

    print("RAG stack loaded")
    yield
    print("Shutting down...")


app = FastAPI(lifespan=lifespan)


@app.get("/health")
def health():
    return {"status": "ok", "ready": vectorStoreDB is not None}


@app.post("/ask")
def ask_endpoint(request: dict, user=Depends(get_current_user)):
    from app.modules.Qa.query import get_answer
    return get_answer(request["question"], llm, vectorStoreDB, user.id, embeddings)
```

---

## Quick Start Checklist for a New Project

When you inherit a bloated backend, run this:

```powershell
# 1. Investigate
pip list | Measure-Object
"{0:N2} GB" -f ((Get-ChildItem -Recurse venv | Measure-Object -Property Length -Sum).Sum / 1GB)

# 2. Backup
python -c "import subprocess; open('requirements-backup.txt','w',encoding='utf-8').write(subprocess.check_output(['pip','freeze']).decode())"

# 3. Find truth
pip install pipreqs
pipreqs app --force --savepath requirements-actual.txt
Get-Content requirements-actual.txt

# 4. Safety check each candidate (use batch script from Phase 3)
# 5. Remove in stages, testing after each
# 6. Rewrite requirements.txt as top-level only
# 7. Fresh-venv test
# 8. Lazy-load heavy imports
# 9. Measure win
# 10. Commit and push
```

---

## The Golden Rules

1. Never commit without a fresh-venv test. "Works on my machine" is a lie.
2. `pip show <pkg> | Select-String "Required-by:"` is your best friend.
3. Move heavy init to `lifespan`. Instant boot is worth the refactor.
4. Top-level `requirements.txt` is the way. Let pip resolve transitives.
5. When in doubt, add a lock file. Use `pip-compile` for production.
6. `.gitignore` must include `venv*/` and `__pycache__/`. Always.

---
