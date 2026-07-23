from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.config import settings
from app.database import get_db
from app.models import Ingredient, User
from app.schemas import RecipeSuggestions
from app.security import decrypt_key
from app.services.ai import ProviderError, get_recipe_suggestions

router = APIRouter(prefix="/api/suggestions", tags=["suggestions"])


def _resolve_provider(user: User) -> tuple[str, str, bool]:
    """Pick (provider, api_key, is_users_own): own key wins, then server defaults."""
    if user.api_provider and user.api_key_encrypted:
        key = decrypt_key(user.api_key_encrypted)
        if key:
            return user.api_provider, key, True
    if settings.gemini_api_key:
        return "gemini", settings.gemini_api_key, False
    if settings.anthropic_api_key:
        return "claude", settings.anthropic_api_key, False
    raise HTTPException(
        status_code=503,
        detail=(
            "No AI provider is set up yet. Google Gemini offers a free API key "
            "— grab one at aistudio.google.com/apikey and add it in Settings."
        ),
    )


@router.post("/", response_model=RecipeSuggestions)
def suggest_recipes(
    user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    provider, api_key, is_own_key = _resolve_provider(user)
    ingredients = db.scalars(
        select(Ingredient)
        .where(Ingredient.user_id == user.id)
        .order_by(Ingredient.name)
    ).all()
    if not ingredients:
        raise HTTPException(status_code=400, detail="Add some ingredients first")
    names = [
        f"{i.quantity:g} {i.unit} {i.name}" if i.quantity and i.unit else i.name
        for i in ingredients
    ]
    try:
        return get_recipe_suggestions(provider, api_key, names)
    except ProviderError as e:
        raise HTTPException(
            status_code=502,
            detail={"message": str(e), "own_key": is_own_key},
        )
