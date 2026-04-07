from pydantic import BaseModel


class UploadOut(BaseModel):
    file_name: str
    file_url: str
    content_type: str | None = None
    size: int
