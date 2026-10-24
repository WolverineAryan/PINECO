import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Security
from fastapi.security import HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from pineco.database import get_db
from pineco.config import settings
from pineco.models import BrandRule, AuditEvent, get_utc_now
from pineco.auth import security_bearer, decode_jwt_token, get_current_user_optional, resolve_workspace_id
from pineco.schemas import RuleCreate, RuleUpdate, RuleResponse

router = APIRouter(prefix="/rules", tags=["Brand Rules"])


@router.get("", response_model=List[RuleResponse])
def list_rules(
    workspace_id: Optional[str] = Query(default=None),
    product_id: Optional[str] = Query(default=None),
    category: Optional[str] = Query(default=None),
    enabled: Optional[bool] = Query(default=None),
    current_user: Optional[dict] = Depends(get_current_user_optional),
    db: Session = Depends(get_db),
):
    ws_id = resolve_workspace_id(workspace_id, current_user)
    query = db.query(BrandRule).filter(BrandRule.workspace_id == ws_id)
    if product_id:
        query = query.filter((BrandRule.product_id == product_id) | (BrandRule.product_id.is_(None)))
    if category:
        query = query.filter(BrandRule.category == category)
    if enabled is not None:
        query = query.filter(BrandRule.enabled == enabled)
    return query.order_by(BrandRule.created_at.desc()).all()


@router.post("", response_model=RuleResponse, status_code=201)
def create_rule(
    payload: RuleCreate,
    actor_id: str = Query(default="usr-manager-marcus"),
    auth: Optional[HTTPAuthorizationCredentials] = Security(security_bearer),
    db: Session = Depends(get_db),
):
    user_payload = None
    if auth and auth.credentials:
        try:
            token_data = decode_jwt_token(auth.credentials)
            user_payload = token_data
            role = token_data.get("role")
            if role in ("creator", "reviewer"):
                raise HTTPException(
                    status_code=403,
                    detail=f"Access Denied: Actors with role '{role}' cannot create brand policy rules. Brand Manager or Admin authority is required.",
                )
        except HTTPException:
            raise
        except Exception:
            pass
    elif actor_id in ("usr-creator-sarah", "usr-reviewer-elena"):
        raise HTTPException(
            status_code=403,
            detail="Access Denied: Brand policy authoring requires Brand Manager or Admin authority.",
        )
    ws_id = resolve_workspace_id(payload.workspace_id, user_payload)
    rule = BrandRule(
        workspace_id=ws_id,
        product_id=payload.product_id,
        name=payload.name,
        category=payload.category,
        description=payload.description,
        pattern=payload.pattern,
        preferred_replacement=payload.preferred_replacement,
        severity=payload.severity,
        channel_scope=payload.channel_scope,
        enabled=payload.enabled,
        version=1,
        created_by=actor_id,
    )
    db.add(rule)
    db.commit()
    db.refresh(rule)

    audit = AuditEvent(
        workspace_id=ws_id,
        actor_id=actor_id,
        entity_type="rule",
        entity_id=rule.id,
        event_type="created",
        metadata_json=json.dumps({"name": rule.name, "category": rule.category}),
    )
    db.add(audit)
    db.commit()

    return rule


@router.patch("/{rule_id}", response_model=RuleResponse)
def update_rule(
    rule_id: str,
    payload: RuleUpdate,
    actor_id: str = Query(default="usr-manager-marcus"),
    auth: Optional[HTTPAuthorizationCredentials] = Security(security_bearer),
    db: Session = Depends(get_db),
):
    if auth and auth.credentials:
        try:
            token_data = decode_jwt_token(auth.credentials)
            role = token_data.get("role")
            if role in ("creator", "reviewer"):
                raise HTTPException(
                    status_code=403,
                    detail=f"Access Denied: Actors with role '{role}' cannot modify brand policy rules. Brand Manager or Admin authority is required.",
                )
        except HTTPException:
            raise
        except Exception:
            pass
    elif actor_id in ("usr-creator-sarah", "usr-reviewer-elena"):
        raise HTTPException(
            status_code=403,
            detail="Access Denied: Brand policy modifications require Brand Manager or Admin authority.",
        )
    rule = db.query(BrandRule).filter(BrandRule.id == rule_id).first()
    if not rule:
        raise HTTPException(status_code=404, detail="Brand rule not found")

    update_data = payload.model_dump(exclude_unset=True)
    if not update_data:
        return rule

    for field, val in update_data.items():
        setattr(rule, field, val)
    rule.version += 1
    rule.updated_at = get_utc_now()

    audit = AuditEvent(
        workspace_id=rule.workspace_id,
        actor_id=actor_id,
        entity_type="rule",
        entity_id=rule.id,
        event_type="updated",
        metadata_json=json.dumps(update_data),
    )
    db.add(audit)
    db.commit()
    db.refresh(rule)
    return rule
