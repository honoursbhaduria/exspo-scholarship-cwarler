import os
import time
from dataclasses import dataclass
from typing import Optional, List, Tuple
from urllib.parse import urljoin, urlparse
import httpx
from bs4 import BeautifulSoup

from crawler.middlewares.ssrf_guard import SSRFGuard
from crawler.pdf_parser import PDFParser
from core.normalizer.text_cleaner import TextNormalizer

@dataclass
class CrawlResult:
    url: str
    canonical_url: str
    http_status: int
    content_type: str
    raw_content: str
    normalized_text: str
    content_hash: str
    snapshot_path: str
    title: Optional[str]
    pdf_links: List[str]
    is_success: bool
    error_message: Optional[str] = None

class WebFetcher:
    USER_AGENT = "Mozilla/5.0 (compatible; ScholarshipIntelligenceBot/1.0; +https://scholarship-intel.org/bot)"

    def __init__(self, timeout: float = 12.0, max_retries: int = 2):
        self.timeout = timeout
        self.max_retries = max_retries

    def fetch(self, url: str) -> CrawlResult:
        # 1. SSRF Safety Check (allow custom offline testing if explicitly marked)
        if not url.startswith("mock://") and not url.startswith("fixture://"):
            is_safe, reason = SSRFGuard.validate_url(url)
            if not is_safe:
                return CrawlResult(
                    url=url,
                    canonical_url=url,
                    http_status=403,
                    content_type="text/plain",
                    raw_content="",
                    normalized_text="",
                    content_hash="",
                    snapshot_path="",
                    title=None,
                    pdf_links=[],
                    is_success=False,
                    error_message=f"SSRF Blocked: {reason}"
                )

        headers = {
            "User-Agent": self.USER_AGENT,
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,application/pdf;q=0.8,*/*;q=0.7",
            "Accept-Language": "en-US,en;q=0.9",
        }

        attempts = 0
        last_error = None

        while attempts <= self.max_retries:
            attempts += 1
            try:
                with httpx.Client(timeout=self.timeout, follow_redirects=True, headers=headers) as client:
                    response = client.get(url)
                    http_status = response.status_code
                    content_type = response.headers.get("content-type", "").lower()
                    canonical_url = str(response.url)

                    if http_status != 200:
                        return CrawlResult(
                            url=url,
                            canonical_url=canonical_url,
                            http_status=http_status,
                            content_type=content_type,
                            raw_content=response.text[:2000],
                            normalized_text="",
                            content_hash="",
                            snapshot_path="",
                            title=None,
                            pdf_links=[],
                            is_success=False,
                            error_message=f"HTTP status {http_status}"
                        )

                    # Handle PDF Content
                    if "application/pdf" in content_type or url.lower().endswith(".pdf"):
                        pdf_bytes = response.content
                        success, pdf_text = PDFParser.extract_text(pdf_bytes)
                        content_hash = TextNormalizer.compute_hash(pdf_text)
                        snapshot_path = TextNormalizer.save_snapshot(response.text, content_hash, ext="pdf")
                        return CrawlResult(
                            url=url,
                            canonical_url=canonical_url,
                            http_status=200,
                            content_type="application/pdf",
                            raw_content=f"[Binary PDF: {len(pdf_bytes)} bytes]",
                            normalized_text=pdf_text,
                            content_hash=content_hash,
                            snapshot_path=snapshot_path,
                            title="Official PDF Notification",
                            pdf_links=[],
                            is_success=success,
                            error_message=None if success else pdf_text
                        )

                    # Handle HTML Content
                    raw_html = response.text
                    normalized_text = TextNormalizer.clean_html(raw_html)
                    content_hash = TextNormalizer.compute_hash(normalized_text)
                    snapshot_path = TextNormalizer.save_snapshot(raw_html, content_hash, ext="html")

                    # Extract page title and linked PDFs
                    soup = BeautifulSoup(raw_html, "lxml")
                    title_tag = soup.find("title")
                    title = title_tag.get_text(strip=True) if title_tag else None

                    pdf_links = []
                    for a in soup.find_all("a", href=True):
                        href = a["href"].strip()
                        if href.lower().endswith(".pdf"):
                            full_pdf_url = urljoin(canonical_url, href)
                            pdf_links.append(full_pdf_url)

                    return CrawlResult(
                        url=url,
                        canonical_url=canonical_url,
                        http_status=200,
                        content_type="text/html",
                        raw_content=raw_html,
                        normalized_text=normalized_text,
                        content_hash=content_hash,
                        snapshot_path=snapshot_path,
                        title=title,
                        pdf_links=pdf_links[:10], # Cap at 10 pdf links
                        is_success=True
                    )

            except Exception as e:
                last_error = str(e)
                time.sleep(0.5 * attempts)

        return CrawlResult(
            url=url,
            canonical_url=url,
            http_status=500,
            content_type="text/plain",
            raw_content="",
            normalized_text="",
            content_hash="",
            snapshot_path="",
            title=None,
            pdf_links=[],
            is_success=False,
            error_message=f"Network error after {attempts} attempts: {last_error}"
        )
