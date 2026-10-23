import io
import pytest
from pineco.engine.parser import parse_uploaded_file, parse_pdf, parse_plain_text


def test_parse_plain_text():
    sample = b"Pineco is an enterprise brand governance system with 99.9% uptime."
    res = parse_plain_text(sample)
    assert res["has_text"] is True
    assert "Pineco" in res["text"]


def test_parse_uploaded_file_txt():
    content = b"Draft announcement: We deliver high-velocity compliant copy."
    res = parse_uploaded_file(content, "draft.txt", "text/plain")
    assert res["file_type"] == "text"
    assert res["word_count"] == 7
    assert "Draft announcement" in res["extracted_text"]


def test_parse_uploaded_file_client_ocr():
    dummy_image = b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR"
    ocr_text = "Headline extracted via OCR: Pineco eliminates brand compliance risk."
    res = parse_uploaded_file(
        dummy_image,
        "banner.png",
        "image/png",
        client_extracted_text=ocr_text,
    )
    assert res["file_type"] == "image_ocr"
    assert res["extracted_text"] == ocr_text
    assert res["word_count"] > 5


def test_parse_file_endpoint(client):
    file_content = b"Enterprise marketing draft for automated review."
    files = {"file": ("campaign.txt", io.BytesIO(file_content), "text/plain")}
    resp = client.post("/api/v1/submissions/parse-file", files=files)
    assert resp.status_code == 200
    data = resp.json()
    assert data["file_type"] == "text"
    assert "Enterprise marketing draft" in data["extracted_text"]
    assert data["word_count"] == 6


def test_upload_and_scan_endpoint(client):
    file_content = b"Pineco guarantees proven approach to brand compliance. Past performance is not indicative of future results."
    files = {"file": ("pr_release.txt", io.BytesIO(file_content), "text/plain")}
    data = {
        "title": "Automated Upload Test PR",
        "channel": "press_release",
    }
    resp = client.post("/api/v1/submissions/upload-and-scan", files=files, data=data)
    assert resp.status_code == 201
    res = resp.json()
    assert "submission_id" in res
    assert "review_id" in res
    assert res["channel"] == "press_release"
    assert "proven approach" in res["extracted_text"]
