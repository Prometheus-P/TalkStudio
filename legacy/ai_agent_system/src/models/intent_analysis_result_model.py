# ai_agent_system/src/models/intent_analysis_result_model.py
from datetime import datetime
from typing import Optional, List, Any
from pydantic import BaseModel, Field, BeforeValidator, ConfigDict
from typing_extensions import Annotated
from bson import ObjectId

PyObjectId = Annotated[str, BeforeValidator(str)]

class IntentAnalysisResult(BaseModel):
    """
    Represents the result of intent analysis for a Discord message.
    """
    id: Optional[PyObjectId] = Field(alias="_id", default=None) # Internal ID
    discordMessageId: str = Field(..., description="The ID of the DiscordMessage this result is for")
    extractedIntents: List[str] = Field(default_factory=list, description="List of identified intents (e.g., '질문', '제안')")
    keywords: List[str] = Field(default_factory=list, description="List of extracted keywords")
    sentiment: str = Field(..., description="Sentiment analysis result (e.g., 'positive', 'negative', 'neutral')")
    analysisModelVersion: str = Field(default="v1.0", description="Version of the NLP model used for analysis")
    analysisTimestamp: datetime = Field(default_factory=datetime.utcnow, description="Timestamp when the analysis was performed")
    rawData: Optional[dict[str, Any]] = Field(default=None, description="Raw output data from the NLP model (optional)")

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str},
        json_schema_extra={
            "example": {
                "discordMessageId": "123456789012345678",
                "extractedIntents": ["질문", "요청"],
                "keywords": ["API", "연동"],
                "sentiment": "neutral",
                "analysisModelVersion": "v1.0",
                "analysisTimestamp": "2023-11-20T10:30:00Z"
            }
        }
    )
