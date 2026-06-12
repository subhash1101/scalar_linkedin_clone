import os
import uuid
from fastapi import UploadFile
from app.core.config import settings


async def save_upload(file: UploadFile, subfolder: str) -> str:
    upload_dir = os.path.join(settings.UPLOAD_DIR, subfolder)
    os.makedirs(upload_dir, exist_ok=True)

    ext = os.path.splitext(file.filename or "file")[1] or ".bin"
    filename = f"{uuid.uuid4().hex}{ext}"
    filepath = os.path.join(upload_dir, filename)

    contents = await file.read()
    with open(filepath, "wb") as f:
        f.write(contents)

    return f"/uploads/{subfolder}/{filename}"
