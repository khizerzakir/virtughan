from __future__ import annotations

import os

os.environ.setdefault("RATE_LIMIT_DEFAULT", "1000/minute")
os.environ.setdefault("RATE_LIMIT_EXPORT", "1000/minute")
os.environ.setdefault("RATE_LIMIT_TILE", "1000/minute")
