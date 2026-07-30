"""Cloudinary file storage — replaces Firebase Storage.

Uploads land under {CLOUDINARY_UPLOAD_FOLDER}/users/{uid}/{item_id}/ in the
Cloudinary media library. Images (JPG/PNG/WEBP) are stored as `image`
resources; PDFs, DOCX, and TXT are stored as `raw` resources so Cloudinary
serves the original bytes untouched.

The permanent `secure_url` and `public_id` returned by Cloudinary are stored
in Firestore at upload time — unlike Firebase signed URLs they never expire,
so no "sign on read" step is needed anymore.
"""
import uuid

import cloudinary
import cloudinary.uploader

from config import (
    CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET,
    CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_UPLOAD_FOLDER,
)
from logger import get_logger

log = get_logger("storage")

cloudinary.config(
    cloud_name=CLOUDINARY_CLOUD_NAME,
    api_key=CLOUDINARY_API_KEY,
    api_secret=CLOUDINARY_API_SECRET,
    secure=True,
)

# MIME types Cloudinary should treat as first-class images. Everything else
# (pdf, docx, txt) goes up as `raw` so the original file is served byte-for-byte.
_IMAGE_MIME_TYPES = {"image/jpeg", "image/png", "image/webp"}


def _resource_type_for(mime_type: str) -> str:
    return "image" if mime_type in _IMAGE_MIME_TYPES else "raw"


def upload_file(uid: str, item_id: str, original_filename: str, file_bytes: bytes, mime_type: str) -> dict:
    """Uploads to Cloudinary and returns the info the caller must persist:

        {
          "public_id":     used later for deletion,
          "resource_type": "image" | "raw" (needed to delete the right asset),
          "url":           permanent https delivery URL for the frontend,
        }
    """
    ext = original_filename.rsplit(".", 1)[-1].lower() if "." in original_filename else ""
    resource_type = _resource_type_for(mime_type)

    # For `raw` resources Cloudinary serves the public_id verbatim as the file
    # name, so keep the extension — browsers then download/preview correctly.
    base_name = uuid.uuid4().hex
    file_name = f"{base_name}.{ext}" if resource_type == "raw" and ext else base_name

    result = cloudinary.uploader.upload(
        file_bytes,
        public_id=file_name,
        folder=f"{CLOUDINARY_UPLOAD_FOLDER}/users/{uid}/{item_id}",
        resource_type=resource_type,
        overwrite=False,
        unique_filename=False,
    )
    log.info("Cloudinary upload ok: %s (%s)", result["public_id"], result["resource_type"])
    return {
        "public_id": result["public_id"],
        "resource_type": result["resource_type"],
        "url": result["secure_url"],
    }


def delete_file(public_id: str, resource_type: str = "raw") -> None:
    """Deletes an asset. Raises if Cloudinary reports anything other than
    'ok' or 'not found' (already gone = fine, delete stays idempotent).
    """
    result = cloudinary.uploader.destroy(public_id, resource_type=resource_type, invalidate=True)
    status = result.get("result")
    if status not in ("ok", "not found"):
        raise RuntimeError(f"Cloudinary destroy failed for {public_id}: {status}")
    log.info("Cloudinary delete ok: %s (%s)", public_id, status)
