from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.models import Ingredient, User
from app.schemas import IngredientCreate, IngredientOut, IngredientUpdate

router = APIRouter(prefix="/api/ingredients", tags=["ingredients"])


def _get_owned(ingredient_id: int, user: User, db: Session) -> Ingredient:
    ingredient = db.get(Ingredient, ingredient_id)
    if ingredient is None or ingredient.user_id != user.id:
        raise HTTPException(status_code=404, detail="Ingredient not found")
    return ingredient


def _name_taken(name: str, user: User, db: Session, exclude_id: int | None = None) -> bool:
    query = select(Ingredient).where(
        Ingredient.user_id == user.id, Ingredient.name == name
    )
    existing = db.scalar(query)
    return existing is not None and existing.id != exclude_id


@router.get("/", response_model=list[IngredientOut])
def list_ingredients(
    user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    return db.scalars(
        select(Ingredient)
        .where(Ingredient.user_id == user.id)
        .order_by(Ingredient.name)
    ).all()


@router.post("/", response_model=IngredientOut, status_code=201)
def create_ingredient(
    body: IngredientCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    name = body.name.strip().lower()
    if _name_taken(name, user, db):
        raise HTTPException(status_code=409, detail=f"'{name}' is already in your kitchen")
    ingredient = Ingredient(
        user_id=user.id, name=name, quantity=body.quantity, unit=body.unit
    )
    db.add(ingredient)
    db.commit()
    db.refresh(ingredient)
    return ingredient


@router.patch("/{ingredient_id}", response_model=IngredientOut)
def update_ingredient(
    ingredient_id: int,
    body: IngredientUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    ingredient = _get_owned(ingredient_id, user, db)
    updates = body.model_dump(exclude_unset=True)
    if "name" in updates:
        updates["name"] = updates["name"].strip().lower()
        if _name_taken(updates["name"], user, db, exclude_id=ingredient.id):
            raise HTTPException(
                status_code=409, detail=f"'{updates['name']}' is already in your kitchen"
            )
    for field, value in updates.items():
        setattr(ingredient, field, value)
    db.commit()
    db.refresh(ingredient)
    return ingredient


@router.delete("/{ingredient_id}", status_code=204)
def delete_ingredient(
    ingredient_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    ingredient = _get_owned(ingredient_id, user, db)
    db.delete(ingredient)
    db.commit()
