from datetime import datetime

from sqlalchemy import ForeignKey, String, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    api_provider: Mapped[str | None] = mapped_column(String(20))
    api_key_encrypted: Mapped[str | None] = mapped_column(String(512))
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())

    ingredients: Mapped[list["Ingredient"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    saved_recipes: Mapped[list["SavedRecipe"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )


class Ingredient(Base):
    __tablename__ = "ingredients"
    __table_args__ = (UniqueConstraint("user_id", "name"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    name: Mapped[str] = mapped_column(String(120))
    quantity: Mapped[float | None]
    unit: Mapped[str | None] = mapped_column(String(40))
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        server_default=func.now(), onupdate=func.now()
    )

    user: Mapped[User] = relationship(back_populates="ingredients")


class SavedRecipe(Base):
    __tablename__ = "saved_recipes"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    title: Mapped[str] = mapped_column(String(200))
    payload: Mapped[dict] = mapped_column(JSONB)
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())

    user: Mapped[User] = relationship(back_populates="saved_recipes")
