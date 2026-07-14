#!/usr/bin/env python3
"""Live SEO probe for Seedance multilingual blog posts."""

from __future__ import annotations

import re
import subprocess
from pathlib import Path

BASE = "https://seedance-2-5.app"
OUT = Path(__file__).resolve().parent / "seo-probe"
OUT.mkdir(parents=True, exist_ok=True)

PATHS = [
    "/blog",
    "/blog/seedance-2-0-features-overview",
    "/de/blog/seedance-2-0-features-overview",
    "/es/blog/seedance-2-0-features-overview",
    "/ja/blog/seedance-2-0-features-overview",
    "/zh-hant/blog/seedance-2-0-features-overview",
    "/de/blog",
    "/es/blog",
    "/llms.txt",
    "/robots.txt",
]


def extract(pattern: str, text: str) -> str:
    match = re.search(pattern, text, re.I | re.S)
    return match.group(1).strip()[:200] if match else ""


def main() -> None:
    for path in PATHS:
        safe = path.strip("/").replace("/", "_") or "root"
        file_path = OUT / f"{safe}.html"
        result = subprocess.run(
            [
                "curl",
                "-sS",
                "-L",
                "-o",
                str(file_path),
                "-w",
                "%{http_code}",
                "--max-time",
                "25",
                BASE + path,
            ],
            capture_output=True,
            text=True,
        )
        code = (result.stdout or "").strip() or "ERR"
        text = (
            file_path.read_text("utf-8", errors="ignore")
            if file_path.exists()
            else ""
        )
        print(f"=== {code} {path} bytes={len(text)}")
        if path.endswith(".txt"):
            print(text[:400].replace("\n", " | "))
            continue

        title = extract(r"<title[^>]*>([^<]*)", text)
        desc = extract(
            r'name=["\']description["\'][^>]*content=["\']([^"\']*)', text
        ) or extract(
            r'content=["\']([^"\']*)["\'][^>]*name=["\']description["\']', text
        )
        canon = extract(
            r'rel=["\']canonical["\'][^>]*href=["\']([^"\']*)', text
        ) or extract(
            r'href=["\']([^"\']*)["\'][^>]*rel=["\']canonical["\']', text
        )
        og_title = extract(
            r'property=["\']og:title["\'][^>]*content=["\']([^"\']*)', text
        )
        og_type = extract(
            r'property=["\']og:type["\'][^>]*content=["\']([^"\']*)', text
        )
        og_image = extract(
            r'property=["\']og:image["\'][^>]*content=["\']([^"\']*)', text
        )
        hreflang = len(re.findall(r"hreflang=", text, re.I))
        ldjson = len(re.findall(r"application/ld\+json", text, re.I))
        h1_matches = re.findall(r"<h1[^>]*>(.*?)</h1>", text, re.I | re.S)
        h1 = re.sub(r"<[^>]+>", "", h1_matches[0]).strip() if h1_matches else ""
        lang_attr = extract(r'<html[^>]*lang=["\']([^"\']*)', text)
        plain = re.sub(
            r"\s+",
            " ",
            re.sub(
                r"<script[\s\S]*?</script>|<style[\s\S]*?</style>|<[^>]+>",
                " ",
                text,
            ),
        )
        print(f"title: {title}")
        print(f"desc: {desc}")
        print(f"canon: {canon}")
        print(f"og:title: {og_title}")
        print(f"og:type: {og_type}")
        print(f"og:image: {og_image[:120]}")
        print(f"hreflang: {hreflang}")
        print(f"ld+json: {ldjson}")
        print(f"h1_count: {len(h1_matches)} h1: {h1[:140]}")
        print(f"lang_attr: {lang_attr}")
        print(
            "EN_marker:",
            ("what ByteDance" in plain)
            or ("video model actually" in plain)
            or ("native multimodal" in plain.lower()),
        )
        print(
            "DE_marker:",
            ("Video-Modell" in plain)
            or ("wirklich kann" in plain)
            or ("ByteDance hat Seedance" in plain),
        )
        print("JA_marker:", ("動画モデル" in plain) or ("機能まとめ" in plain))
        print(
            "ES_english_body:",
            path.startswith("/es/") and "what ByteDance" in plain,
        )
        idx = plain.find("Seedance")
        print(f"text_snip: {(plain[idx:idx + 180] if idx >= 0 else plain[:180])}")
        print(
            "robots:",
            extract(r'name=["\']robots["\'][^>]*content=["\']([^"\']*)', text),
        )


if __name__ == "__main__":
    main()
