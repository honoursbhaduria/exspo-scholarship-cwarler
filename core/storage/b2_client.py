import hashlib
import time
from typing import Optional, Dict, Any
import httpx
from core.config import settings

class B2StorageManager:
    """
    Backblaze B2 Object Storage Manager.
    Uploads document snapshots and PDF files to Backblaze B2 bucket.
    """
    _auth_data: Optional[Dict[str, Any]] = None
    _auth_expiry: float = 0
    _upload_url: Optional[str] = None
    _upload_token: Optional[str] = None

    @classmethod
    def is_configured(cls) -> bool:
        return bool(settings.B2_KEY_ID and settings.B2_APPLICATION_KEY and (settings.B2_BUCKET_ID or settings.B2_BUCKET_NAME))

    @classmethod
    def _authorize(cls) -> bool:
        if cls._auth_data and time.time() < cls._auth_expiry:
            return True

        if not cls.is_configured():
            return False

        try:
            with httpx.Client(timeout=10.0) as client:
                res = client.get(
                    "https://api.backblazeb2.com/b2api/v3/b2_authorize_account",
                    auth=(settings.B2_KEY_ID, settings.B2_APPLICATION_KEY)
                )
                if res.status_code == 200:
                    cls._auth_data = res.json()
                    cls._auth_expiry = time.time() + 86000  # Token valid for 24h
                    cls._upload_url = None
                    cls._upload_token = None
                    return True
        except Exception:
            pass
        return False

    @classmethod
    def _get_upload_url(cls) -> bool:
        if not cls._authorize():
            return False

        if cls._upload_url and cls._upload_token:
            return True

        try:
            api_url = cls._auth_data["apiInfo"]["storageApi"]["apiUrl"]
            token = cls._auth_data["authorizationToken"]
            bucket_id = settings.B2_BUCKET_ID

            # If bucket_id not set, resolve from bucket_name
            if not bucket_id and settings.B2_BUCKET_NAME:
                account_id = cls._auth_data["accountId"]
                with httpx.Client(timeout=10.0) as client:
                    list_res = client.post(
                        f"{api_url}/b2api/v3/b2_list_buckets",
                        headers={"Authorization": token},
                        json={"accountId": account_id, "bucketName": settings.B2_BUCKET_NAME}
                    )
                    if list_res.status_code == 200:
                        buckets = list_res.json().get("buckets", [])
                        if buckets:
                            bucket_id = buckets[0]["bucketId"]

            if not bucket_id:
                return False

            with httpx.Client(timeout=10.0) as client:
                res = client.post(
                    f"{api_url}/b2api/v3/b2_get_upload_url",
                    headers={"Authorization": token},
                    json={"bucketId": bucket_id}
                )
                if res.status_code == 200:
                    data = res.json()
                    cls._upload_url = data["uploadUrl"]
                    cls._upload_token = data["authorizationToken"]
                    return True
        except Exception:
            pass
        return False

    @classmethod
    def upload_snapshot(cls, file_name: str, content: str | bytes, content_type: str = "text/html") -> Optional[str]:
        """
        Uploads snapshot content to Backblaze B2 and returns its B2 file path / URL.
        """
        if not cls.is_configured():
            return None

        if not cls._get_upload_url():
            return None

        data = content.encode("utf-8") if isinstance(content, str) else content
        sha1 = hashlib.sha1(data).hexdigest()

        try:
            with httpx.Client(timeout=15.0) as client:
                res = client.post(
                    cls._upload_url,
                    headers={
                        "Authorization": cls._upload_token,
                        "X-Bz-File-Name": file_name,
                        "Content-Type": content_type,
                        "Content-Length": str(len(data)),
                        "X-Bz-Content-Sha1": sha1
                    },
                    content=data
                )
                if res.status_code == 200:
                    return f"b2://{settings.B2_BUCKET_NAME}/{file_name}"
                elif res.status_code in (401, 503):
                    # Refresh upload url and retry once
                    cls._upload_url = None
                    cls._upload_token = None
                    if cls._get_upload_url():
                        retry_res = client.post(
                            cls._upload_url,
                            headers={
                                "Authorization": cls._upload_token,
                                "X-Bz-File-Name": file_name,
                                "Content-Type": content_type,
                                "Content-Length": str(len(data)),
                                "X-Bz-Content-Sha1": sha1
                            },
                            content=data
                        )
                        if retry_res.status_code == 200:
                            return f"b2://{settings.B2_BUCKET_NAME}/{file_name}"
        except Exception:
            pass

        return None
