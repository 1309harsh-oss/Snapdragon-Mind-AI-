from typing import Optional
from pydantic import BaseModel

class PrivacyStatusResponse(BaseModel):
    local_processing_only: bool
    cloud_requests_blocked: int
    local_documents_count: int
    encryption_status: str
    data_retention_days: int
    privacy_badge: str

class PrivacySettingsUpdate(BaseModel):
    local_only: Optional[bool] = None
    telemetry_opt_in: Optional[bool] = None
    cloud_api_key: Optional[str] = None
