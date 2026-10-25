from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from enum import Enum


class EducationLevel(str, Enum):
    school = "school"
    undergraduate = "undergraduate"
    postgraduate = "postgraduate"
    other = "other"


class ExplanationStyle(str, Enum):
    concise = "concise"
    detailed = "detailed"
    step_by_step = "step_by_step"


class DifficultyPreference(str, Enum):
    beginner = "beginner"
    intermediate = "intermediate"
    advanced = "advanced"


class ThemePreference(str, Enum):
    light = "light"
    dark = "dark"
    system = "system"


class profileResponse(BaseModel):
    id: UUID
    display_name: str
    username: str
    avatar_url: str | None = None
    bio: str

    # Profile preferences
    education_level: EducationLevel
    field_of_study: str | None = None
    current_course: str | None = None
    preferred_language: str
    explanation_style: ExplanationStyle
    difficulty_preference: DifficultyPreference
    theme_preference: ThemePreference | None = None

    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class profileUpdate(BaseModel):
    # Legacy fields
    display_name: str | None = None
    username: str | None = None
    avatar_url: str | None = None
    bio: str | None = None

    # Profile preferences
    education_level: EducationLevel | None = None
    field_of_study: str | None = None
    current_course: str | None = None
    preferred_language: str | None = None
    explanation_style: ExplanationStyle | None = None
    difficulty_preference: DifficultyPreference | None = None
    theme_preference: ThemePreference | None = None