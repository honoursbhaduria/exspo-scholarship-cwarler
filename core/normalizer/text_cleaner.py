import hashlib
import os
import re
from pathlib import Path
from typing import Tuple
from bs4 import BeautifulSoup
from core.config import settings

class TextNormalizer:
    @staticmethod
    def clean_html(html_content: str) -> str:
        """
        Strips navigation, footers, headers, scripts, styles, ads, and preserves table structures.
        """
        if not html_content:
            return ""

        soup = BeautifulSoup(html_content, "lxml")

        # 1. Remove non-content elements
        for element in soup(["script", "style", "nav", "footer", "header", "noscript", "svg", "form"]):
            element.decompose()

        # 2. Format HTML tables into structured text grids so table facts are preserved
        for table in soup.find_all("table"):
            rows = []
            for tr in table.find_all("tr"):
                cells = [c.get_text(strip=True) for c in tr.find_all(["th", "td"])]
                if any(cells):
                    rows.append(" | ".join(cells))
            if rows:
                table_text = "\n[TABLE DATA]\n" + "\n".join(rows) + "\n[/TABLE DATA]\n"
                table.replace_with(table_text)

        # 3. Get text and normalize spaces
        text = soup.get_text(separator="\n")
        lines = [line.strip() for line in text.splitlines()]
        # Collapse multiple blank lines
        clean_lines = []
        blank = False
        for line in lines:
            if line:
                clean_lines.append(line)
                blank = False
            elif not blank:
                clean_lines.append("")
                blank = True

        return "\n".join(clean_lines).strip()

    @classmethod
    def compute_hash(cls, text: str) -> str:
        """
        Computes SHA256 of normalized text.
        """
        normalized = " ".join(text.split()).lower()
        return hashlib.sha256(normalized.encode("utf-8")).hexdigest()

    @classmethod
    def save_snapshot(cls, raw_content: str, content_hash: str, ext: str = "html") -> str:
        """
        Saves raw document snapshot to storage/snapshots/sha256/{prefix}/{hash}.{ext}
        """
        base_dir = Path(settings.SNAPSHOT_DIR)
        sub_dir = base_dir / "sha256" / content_hash[:2]
        sub_dir.mkdir(parents=True, exist_ok=True)
        
        file_path = sub_dir / f"{content_hash}.{ext}"
        if not file_path.exists():
            with open(file_path, "w", encoding="utf-8", errors="ignore") as f:
                f.write(raw_content)

        return str(file_path)
