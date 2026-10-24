from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session

from pineco.database import get_db
from pineco.models import Product, AuditEvent, BrandRule, ApprovedFact, Submission
from pineco.schemas import ProductCreate, ProductResponse, ProductUpdate
from pineco.config import settings
from pineco.auth import get_current_user_optional, resolve_workspace_id

router = APIRouter(prefix="/products", tags=["products"])


@router.get("", response_model=List[ProductResponse])
def list_products(
    workspace_id: Optional[str] = Query(default=None),
    current_user: Optional[dict] = Depends(get_current_user_optional),
    db: Session = Depends(get_db),
):
    """Lists all products / project folders configured for a workspace."""
    ws_id = resolve_workspace_id(workspace_id, current_user)
    products = (
        db.query(Product)
        .filter(Product.workspace_id == ws_id)
        .order_by(Product.created_at.desc())
        .all()
    )
    return products


@router.post("", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(
    payload: ProductCreate,
    db: Session = Depends(get_db),
    current_user: Optional[dict] = Depends(get_current_user_optional),
):
    """Creates a new isolated product compliance workspace folder."""
    ws_id = resolve_workspace_id(payload.workspace_id, current_user)
    actor_id = (current_user.get("sub") or current_user.get("id")) if current_user else settings.DEFAULT_USER_ADMIN

    product = Product(
        workspace_id=ws_id,
        name=payload.name,
        description=payload.description,
        category=payload.category,
        created_by=actor_id,
    )
    db.add(product)
    db.flush()

    audit = AuditEvent(
        workspace_id=ws_id,
        actor_id=actor_id,
        entity_type="product",
        entity_id=product.id,
        event_type="created",
        metadata_json=f'{{"name": "{product.name}", "category": "{product.category}"}}',
    )
    db.add(audit)
    db.commit()
    db.refresh(product)
    return product


@router.get("/{product_id}", response_model=ProductResponse)
def get_product(
    product_id: str,
    db: Session = Depends(get_db),
):
    """Retrieves a specific product by ID."""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(
    product_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[dict] = Depends(get_current_user_optional),
):
    """Deletes a product folder."""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    actor_id = (current_user.get("sub") or current_user.get("id")) if current_user else settings.DEFAULT_USER_ADMIN
    ws_id = product.workspace_id

    db.delete(product)
    audit = AuditEvent(
        workspace_id=ws_id,
        actor_id=actor_id,
        entity_type="product",
        entity_id=product_id,
        event_type="deleted",
    )
    db.add(audit)
    db.commit()
    return None
