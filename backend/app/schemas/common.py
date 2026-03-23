from pydantic import BaseModel, ConfigDict


class MessageResponse(BaseModel):
    message: str


class TimestampSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

