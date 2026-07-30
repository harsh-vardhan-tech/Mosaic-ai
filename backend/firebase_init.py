import json
import os

import firebase_admin
from firebase_admin import credentials, firestore

from config import (
    FIREBASE_ADMIN_CREDENTIALS_JSON,
    FIREBASE_ADMIN_CREDENTIALS_PATH,
)
from logger import get_logger

log = get_logger("firebase")

# Credentials can come from an env var containing the raw service-account JSON
# (hosted environments) or from a file on disk (local dev).
if FIREBASE_ADMIN_CREDENTIALS_JSON:
    try:
        _cred_dict = json.loads(FIREBASE_ADMIN_CREDENTIALS_JSON)
    except ValueError:
        raise SystemExit(
            "\n[CONFIG ERROR] FIREBASE_ADMIN_CREDENTIALS_JSON is not valid JSON.\n"
            "Paste the FULL contents of the service-account JSON file (starts with '{').\n"
        )
    _cred = credentials.Certificate(_cred_dict)
elif os.path.exists(FIREBASE_ADMIN_CREDENTIALS_PATH):
    _cred = credentials.Certificate(FIREBASE_ADMIN_CREDENTIALS_PATH)
else:
    raise SystemExit(
        f"\n[CONFIG ERROR] No Firebase Admin credentials. Set FIREBASE_ADMIN_CREDENTIALS_JSON "
        f"(paste the service-account JSON) or put the file at {FIREBASE_ADMIN_CREDENTIALS_PATH}.\n"
        f"Download it from Firebase Console -> Project Settings -> Service Accounts -> "
        f"Generate new private key.\n"
    )

# Firestore (database) + Auth token verification only — file storage now lives
# in Cloudinary (see storage_utils.py), so no storageBucket is configured here.
firebase_app = firebase_admin.initialize_app(_cred)

db = firestore.client()

log.info("Firebase Admin initialized (project: %s) — Firestore + Auth only", _cred.project_id)
