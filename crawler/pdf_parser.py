import io
from typing import Optional, Tuple
from pypdf import PdfReader

class PDFParser:
    @classmethod
    def extract_text(cls, pdf_bytes: bytes) -> Tuple[bool, str]:
        """
        Extracts plain text from PDF bytes using pypdf.
        Returns (success, extracted_text)
        """
        try:
            stream = io.BytesIO(pdf_bytes)
            reader = PdfReader(stream)
            extracted_pages = []

            for i, page in enumerate(reader.pages):
                text = page.extract_text()
                if text:
                    extracted_pages.append(f"--- PAGE {i+1} ---\n{text.strip()}")

            full_text = "\n\n".join(extracted_pages).strip()
            if len(full_text) > 50:
                return True, full_text
            return False, "PDF contained no extractable textual content (possibly image scan)."
        except Exception as e:
            return False, f"PDF extraction failed: {str(e)}"
