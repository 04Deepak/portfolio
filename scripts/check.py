#!/usr/bin/env python3
"""Sanity checks for the portfolio site.

Runs in CI and locally with no dependencies:

    python3 scripts/check.py

Checks, per page:
  * internal links resolve to a file that exists
  * a <title> and a meta description are present
  * exactly one <h1>
  * every <img> has an alt attribute
  * no secret-shaped strings anywhere in the tree

Exits non-zero if anything fails, so CI blocks the merge.
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# Pages that are intentionally excluded from a rule.
NO_DESCRIPTION_OK = {"404.html"}

# Substrings that must never appear in committed source. The site previously
# shipped a live SMTP token in index.html; this is what stops that recurring.
SECRET_PATTERNS = [
    ("SecureToken", "SMTP.js secure token"),
    ("smtpjs.com", "SMTP.js include"),
    ("Password :", "hardcoded password"),
    ("elasticemail", "ElasticEmail credentials"),
]

SCAN_SUFFIXES = {".html", ".js", ".css"}

failures: list[str] = []
checked_pages = 0
checked_links = 0


def fail(msg: str) -> None:
    failures.append(msg)


def html_files() -> list[Path]:
    return sorted(
        p for p in ROOT.rglob("*.html")
        if ".git" not in p.parts and "node_modules" not in p.parts
    )


def check_page(path: Path) -> None:
    global checked_pages, checked_links
    checked_pages += 1
    rel = path.relative_to(ROOT)
    html = path.read_text(encoding="utf-8")

    if not re.search(r"<title>\s*\S", html):
        fail(f"{rel}: missing <title>")

    if rel.name not in NO_DESCRIPTION_OK and 'name="description"' not in html:
        fail(f"{rel}: missing meta description")

    h1_count = len(re.findall(r"<h1[\s>]", html))
    if h1_count != 1:
        fail(f"{rel}: expected exactly one <h1>, found {h1_count}")

    for img in re.findall(r"<img\b[^>]*>", html):
        if not re.search(r'\balt\s*=\s*"[^"]+"', img):
            fail(f"{rel}: <img> without a meaningful alt attribute")

    for href in re.findall(r'href="([^"]+)"', html):
        if href.startswith(("http://", "https://", "mailto:", "tel:", "data:", "#")):
            continue
        target = href.split("#", 1)[0]
        if not target:
            continue

        if target.startswith("/portfolio/"):
            resolved = ROOT / target[len("/portfolio/"):]
        elif target.startswith("/"):
            resolved = ROOT / target.lstrip("/")
        else:
            resolved = path.parent / target

        if target.endswith("/"):
            resolved = resolved / "index.html"

        checked_links += 1
        if not resolved.exists():
            fail(f"{rel}: broken link {href!r} -> {resolved.relative_to(ROOT)}")


def check_secrets() -> None:
    for path in sorted(ROOT.rglob("*")):
        if not path.is_file() or path.suffix not in SCAN_SUFFIXES:
            continue
        if ".git" in path.parts:
            continue
        text = path.read_text(encoding="utf-8", errors="ignore")
        for needle, label in SECRET_PATTERNS:
            if needle.lower() in text.lower():
                fail(f"{path.relative_to(ROOT)}: possible {label} ({needle!r})")


def main() -> int:
    pages = html_files()
    if not pages:
        fail("no HTML files found")

    for page in pages:
        check_page(page)
    check_secrets()

    print(f"checked {checked_pages} pages, {checked_links} internal links")

    if failures:
        print(f"\n{len(failures)} problem(s):\n", file=sys.stderr)
        for f in failures:
            print(f"  ✗ {f}", file=sys.stderr)
        return 1

    print("all checks passed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
