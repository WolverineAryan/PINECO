import io
import os
import base64
import hashlib
import logging
from typing import Dict, Any, Optional

import pypdf
import docx
from PIL import Image

from pineco.config import settings

logger = logging.getLogger("pineco.parser")


def calculate_file_sha256(content: bytes) -> str:
    return hashlib.sha256(content).hexdigest()


def parse_pdf(file_bytes: bytes) -> Dict[str, Any]:
    """Extracts text from a PDF file using pypdf."""
    reader = pypdf.PdfReader(io.BytesIO(file_bytes))
    page_count = len(reader.pages)
    pages_text = []

    for idx, page in enumerate(reader.pages):
        page_content = page.extract_text() or ""
        cleaned = page_content.strip()
        if cleaned:
            pages_text.append(cleaned)

    extracted_text = "\n\n".join(pages_text)
    return {
        "text": extracted_text,
        "page_count": page_count,
        "has_text": bool(extracted_text.strip()),
    }


def parse_docx(file_bytes: bytes) -> Dict[str, Any]:
    """Extracts text from a Microsoft Word .docx document."""
    doc = docx.Document(io.BytesIO(file_bytes))
    paragraphs = [p.text.strip() for p in doc.paragraphs if p.text.strip()]

    # Extract text from tables if any
    for table in doc.tables:
        for row in table.rows:
            row_items = [c.text.strip() for c in row.cells if c.text.strip()]
            if row_items:
                paragraphs.append(" | ".join(row_items))

    extracted_text = "\n\n".join(paragraphs)
    return {
        "text": extracted_text,
        "paragraph_count": len(paragraphs),
        "has_text": bool(extracted_text.strip()),
    }


def parse_plain_text(file_bytes: bytes) -> Dict[str, Any]:
    """Decodes plain text or markdown files."""
    try:
        text = file_bytes.decode("utf-8")
    except UnicodeDecodeError:
        text = file_bytes.decode("latin-1", errors="replace")
    return {
        "text": text.strip(),
        "has_text": bool(text.strip()),
    }


def inspect_image(file_bytes: bytes, filename: str) -> Dict[str, Any]:
    """Inspects image metadata using Pillow and prepares for OCR."""
    img = Image.open(io.BytesIO(file_bytes))
    width, height = img.size
    img_format = img.format or "UNKNOWN"

    return {
        "format": img_format,
        "width": width,
        "height": height,
        "mode": img.mode,
    }


def parse_uploaded_file(
    file_bytes: bytes,
    filename: str,
    content_type: Optional[str] = None,
    client_extracted_text: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Unified multi-format file ingestion pipeline:
    Supports PDF documents, DOCX documents, TXT/MD files, and Images (with OCR).
    """
    file_hash = calculate_file_sha256(file_bytes)
    ext = os.path.splitext(filename)[1].lower().strip(".")
    size_bytes = len(file_bytes)

    # If client already performed browser OCR with Tesseract.js, prioritize that verified text
    if client_extracted_text and client_extracted_text.strip():
        text = client_extracted_text.strip()
        file_type = "image_ocr" if ext in ["png", "jpg", "jpeg", "webp", "bmp", "tiff"] else ext
        words = len(text.split())
        return {
            "filename": filename,
            "file_type": file_type,
            "content_type": content_type or "application/octet-stream",
            "file_hash": file_hash,
            "size_bytes": size_bytes,
            "extracted_text": text,
            "char_count": len(text),
            "word_count": words,
            "method": "client_tesseract_ocr" if "image" in file_type else "direct_text",
            "metadata": {"source": "client_ocr", "filename": filename},
        }

    # PDF Document Parsing
    if ext == "pdf" or (content_type and "pdf" in content_type):
        res = parse_pdf(file_bytes)
        text = res["text"]
        return {
            "filename": filename,
            "file_type": "pdf",
            "content_type": content_type or "application/pdf",
            "file_hash": file_hash,
            "size_bytes": size_bytes,
            "extracted_text": text,
            "char_count": len(text),
            "word_count": len(text.split()) if text else 0,
            "method": "pypdf_parser",
            "metadata": {"pages": res["page_count"], "has_embedded_text": res["has_text"]},
        }

    # Word DOCX Parsing
    if ext in ["docx", "doc"] or (content_type and "word" in content_type):
        res = parse_docx(file_bytes)
        text = res["text"]
        return {
            "filename": filename,
            "file_type": "docx",
            "content_type": content_type or "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "file_hash": file_hash,
            "size_bytes": size_bytes,
            "extracted_text": text,
            "char_count": len(text),
            "word_count": len(text.split()) if text else 0,
            "method": "python_docx_parser",
            "metadata": {"paragraphs": res["paragraph_count"]},
        }

    # Plain Text / Markdown / CSV / JSON
    if ext in ["txt", "md", "csv", "json", "rtf"] or (content_type and "text" in content_type):
        res = parse_plain_text(file_bytes)
        text = res["text"]
        return {
            "filename": filename,
            "file_type": "text",
            "content_type": content_type or "text/plain",
            "file_hash": file_hash,
            "size_bytes": size_bytes,
            "extracted_text": text,
            "char_count": len(text),
            "word_count": len(text.split()) if text else 0,
            "method": "utf8_decoder",
            "metadata": {},
        }

    # Image Files (PNG, JPG, JPEG, WEBP, BMP, TIFF)
    if ext in ["png", "jpg", "jpeg", "webp", "bmp", "tiff"] or (content_type and "image" in content_type):
        img_info = inspect_image(file_bytes, filename)
        
        # If server-side Vision API key is configured, we can extract via Vision LLM
        vision_key = settings.GROK_API_KEY or settings.LLM_API_KEY
        if vision_key and settings.LLM_PROVIDER in ["grok", "xai", "openai"]:
            try:
                base64_data = base64.b64encode(file_bytes).decode("utf-8")
                mime = content_type or f"image/{ext}"
                import httpx
                headers = {"Authorization": f"Bearer {vision_key}", "Content-Type": "application/json"}
                vision_payload = {
                    "model": settings.LLM_MODEL,
                    "messages": [
                        {
                            "role": "user",
                            "content": [
                                {
                                    "type": "text",
                                    "text": "Extract all marketing, advertising, product claims, disclaimer, and body text verbatim from this image. Do not summarize or explain, output only the exact transcribed text.",
                                },
                                {
                                    "type": "image_url",
                                    "image_url": {"url": f"data:{mime};base64,{base64_data}"},
                                },
                            ],
                        }
                    ],
                    "temperature": 0.0,
                }
                url = settings.LLM_BASE_URL or "https://api.x.ai/v1/chat/completions"
                resp = httpx.post(url, json=vision_payload, headers=headers, timeout=20.0)
                if resp.status_code == 200:
                    ocr_text = resp.json()["choices"][0]["message"]["content"].strip()
                    return {
                        "filename": filename,
                        "file_type": "image",
                        "content_type": mime,
                        "file_hash": file_hash,
                        "size_bytes": size_bytes,
                        "extracted_text": ocr_text,
                        "char_count": len(ocr_text),
                        "word_count": len(ocr_text.split()),
                        "method": "server_vision_ocr",
                        "metadata": img_info,
                    }
            except Exception as exc:
                logger.warning(f"Server vision OCR fallback: {exc}")

        # Fallback / client OCR target
        return {
            "filename": filename,
            "file_type": "image",
            "content_type": content_type or f"image/{ext}",
            "file_hash": file_hash,
            "size_bytes": size_bytes,
            "extracted_text": "",
            "char_count": 0,
            "word_count": 0,
            "method": "client_tesseract_ocr_pending",
            "metadata": img_info,
        }

    # Generic Fallback
    res = parse_plain_text(file_bytes)
    return {
        "filename": filename,
        "file_type": ext or "unknown",
        "content_type": content_type or "application/octet-stream",
        "file_hash": file_hash,
        "size_bytes": size_bytes,
        "extracted_text": res["text"],
        "char_count": len(res["text"]),
        "word_count": len(res["text"].split()) if res["text"] else 0,
        "method": "fallback_decoder",
        "metadata": {},
    }
