from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field


# --- Auth ---

class RegisterIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    email: EmailStr
    own_key_provider: Literal["gemini", "claude"] | None = None
    default_provider: Literal["gemini", "claude"] | None = None


class ApiKeyIn(BaseModel):
    provider: Literal["gemini", "claude"]
    api_key: str = Field(min_length=10, max_length=300)


# --- Ingredients ---

class IngredientCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    quantity: float | None = Field(default=None, gt=0)
    unit: str | None = Field(default=None, max_length=40)


class IngredientUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=120)
    quantity: float | None = Field(default=None, gt=0)
    unit: str | None = Field(default=None, max_length=40)


class IngredientOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    quantity: float | None
    unit: str | None


# --- Recipes (Claude structured output + saved recipes) ---

class Recipe(BaseModel):
    title: str
    description: str
    ingredients_used: list[str]
    missing_ingredients: list[str]
    steps: list[str]
    prep_time_minutes: int
    cook_time_minutes: int


class RecipeSuggestions(BaseModel):
    recipes: list[Recipe]


class SavedRecipeOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    payload: Recipe
    created_at: datetime
