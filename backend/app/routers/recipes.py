from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.models import SavedRecipe, User
from app.schemas import Recipe, SavedRecipeOut

router = APIRouter(prefix="/api/recipes", tags=["recipes"])


@router.get("/", response_model=list[SavedRecipeOut])
def list_saved_recipes(
    user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    return db.scalars(
        select(SavedRecipe)
        .where(SavedRecipe.user_id == user.id)
        .order_by(SavedRecipe.created_at.desc())
    ).all()


@router.post("/", response_model=SavedRecipeOut, status_code=201)
def save_recipe(
    body: Recipe,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    saved = SavedRecipe(user_id=user.id, title=body.title, payload=body.model_dump())
    db.add(saved)
    db.commit()
    db.refresh(saved)
    return saved


@router.delete("/{recipe_id}", status_code=204)
def delete_saved_recipe(
    recipe_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    saved = db.get(SavedRecipe, recipe_id)
    if saved is None or saved.user_id != user.id:
        raise HTTPException(status_code=404, detail="Recipe not found")
    db.delete(saved)
    db.commit()
