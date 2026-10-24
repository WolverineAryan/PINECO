import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Security
from fastapi.security import HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from pineco.database import get_db
from pineco.config import settings
from pineco.models import ApprovedFact, AuditEvent
from pineco.auth import security_bearer, decode_jwt_token
from pineco.schemas import FactCreate, FactResponse

router = APIRouter(prefix="/facts", tags=["Approved Facts"])


@router.get("", response_model=List[FactResponse])
def list_facts(
    workspace_id: Optional[str] = Query(default=None),
    product_id: Optional[str] = Query(default=None),
    status: Optional[str] = Query(default=None),
    db: Session = Depends(get_db),
):
    ws_id = workspace_id or settings.DEFAULT_WORKSPACE_ID
    query = db.query(ApprovedFact).filter(ApprovedFact.workspace_id == ws_id)
    if product_id:
        query = query.filter((ApprovedFact.product_id == product_id) | (ApprovedFact.product_id.is_(None)))
    if status:
        query = query.filter(ApprovedFact.approval_status == status)
    return query.order_by(ApprovedFact.created_at.desc()).all()


@router.post("", response_model=FactResponse, status_code=201)
def create_fact(
    payload: FactCreate,
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
                    detail=f"Access Denied: Actors with role '{role}' cannot create ground truth facts. Brand Manager or Admin authority is required.",
                )
        except HTTPException:
            raise
        except Exception:
            pass
    elif actor_id in ("usr-creator-sarah", "usr-reviewer-elena"):
        raise HTTPException(
            status_code=403,
            detail="Access Denied: Creating approved facts requires Brand Manager or Admin authority.",
        )
    ws_id = payload.workspace_id or settings.DEFAULT_WORKSPACE_ID
    fact = ApprovedFact(
        workspace_id=ws_id,
        product_id=payload.product_id,
        statement=payload.statement,
        source_title=payload.source_title,
        source_reference=payload.source_reference,
        source_url=payload.source_url,
        owner=payload.owner,
        approval_status=payload.approval_status,
        valid_from=payload.valid_from,
        valid_until=payload.valid_until,
        created_by=actor_id,
    )
    db.add(fact)
    db.commit()
    db.refresh(fact)

    audit = AuditEvent(
        workspace_id=ws_id,
        actor_id=actor_id,
        entity_type="fact",
        entity_id=fact.id,
        event_type="created",
        metadata_json=json.dumps({"source_title": fact.source_title, "owner": fact.owner}),
    )
    db.add(audit)
    db.commit()

    return fact
