from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from fastapi import HTTPException
from pydantic import BaseModel
from app.db.deps import get_db
from app.core.deps import get_current_user
from app.models.organization import Organization
from app.models.user import User
from app.models.upgrade_request import UpgradeRequest
from app.models.patient import Patient
from typing import Literal
from app.models.subscription import OrganizationSubscription
router = APIRouter()

class OrganizationCreate(BaseModel):
    name: str
    email: str
    phone: str | None = None
    subscription_plan: str = "basic"
    max_users: int = 10


@router.get("/organizations")
def get_organizations(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    if current_user.role != "super_admin":
        return {"detail": "Access denied"}

    organizations = db.query(Organization).all()

    return organizations


@router.post("/organizations")
def create_organization(
    payload: OrganizationCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    if current_user.role != "super_admin":
        return {"detail": "Access denied"}

    existing = db.query(Organization).filter(
        Organization.email == payload.email
    ).first()

    if existing:
        return {"detail": "Organization already exists"}

    organization = Organization(
        name=payload.name,
        email=payload.email,
        phone=payload.phone,
        subscription_plan=payload.subscription_plan,
        max_users=payload.max_users
    )

    db.add(organization)
    db.commit()
    db.refresh(organization)

    return organization

@router.get("/doctors")
def get_doctors(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    if current_user.role != "super_admin":
        return {"detail": "Access denied"}

    doctors = db.query(User).filter(
        User.role == "practitioner"
    ).all()

    return doctors

@router.get("/patients")
def get_patients(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    if current_user.role != "super_admin":
        return {"detail": "Access denied"}

    return db.query(Patient).all()




class SubscriptionCreate(BaseModel):
    organization_id: str
    plan_name: Literal[
        "free_trial",
        "basic",
        "premium",
        "enterprise"
    ]
    report_limit: int
    transcription_limit: int


@router.get("/subscriptions")
def get_subscriptions(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    if current_user.role != "super_admin":
        return {"detail": "Access denied"}

    subscriptions = (
        db.query(
            OrganizationSubscription,
            Organization.name
        )
        .join(
            Organization,
            Organization.organization_id ==
            OrganizationSubscription.organization_id
        )
        .all()
    )

    result = []

    for subscription, organization_name in subscriptions:
        result.append({
            "subscription_id": subscription.subscription_id,
            "organization_name": organization_name,
            "plan_name": subscription.plan_name,
            "report_limit": subscription.report_limit,
            "reports_used": subscription.reports_used,
            "transcription_limit": subscription.transcription_limit,
            "transcriptions_used": subscription.transcriptions_used,
            "status": subscription.status,
        })

    return result

@router.post("/subscriptions")
def create_subscription(
    payload: SubscriptionCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    if current_user.role != "super_admin":
        raise HTTPException(
            status_code=403,
            detail="Access denied"
        )

    organization = db.query(Organization).filter(
        Organization.organization_id == payload.organization_id
    ).first()

    if not organization:
        raise HTTPException(
            status_code=404,
            detail="Organization not found"
        )

    existing = db.query(
        OrganizationSubscription
    ).filter(
        OrganizationSubscription.organization_id == payload.organization_id
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Subscription already exists"
        )

    subscription = OrganizationSubscription(
        organization_id=payload.organization_id,
        plan_name=payload.plan_name,
        report_limit=payload.report_limit,
        transcription_limit=payload.transcription_limit
    )

    db.add(subscription)
    db.commit()
    db.refresh(subscription)

    return subscription



class SubscriptionUpdate(BaseModel):
    plan_name: str
    report_limit: int
    transcription_limit: int
    status: str


from fastapi import HTTPException

@router.put("/subscriptions/{subscription_id}")
def update_subscription(
    subscription_id: str,
    payload: SubscriptionUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    if current_user.role != "super_admin":
        raise HTTPException(
            status_code=403,
            detail="Access denied"
        )

    subscription = db.query(
        OrganizationSubscription
    ).filter(
        OrganizationSubscription.subscription_id == subscription_id
    ).first()

    if not subscription:
        raise HTTPException(
            status_code=404,
            detail="Subscription not found"
        )

    subscription.plan_name = payload.plan_name
    subscription.report_limit = payload.report_limit
    subscription.transcription_limit = payload.transcription_limit
    subscription.status = payload.status

    db.commit()
    db.refresh(subscription)

    return subscription


@router.get("/usage")
def get_usage(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    if current_user.role != "super_admin":
        return {"detail": "Access denied"}

    subscriptions = (
        db.query(
            OrganizationSubscription,
            Organization.name
        )
        .join(
            Organization,
            Organization.organization_id ==
            OrganizationSubscription.organization_id
        )
        .all()
    )

    result = []

    for sub, org_name in subscriptions:
        result.append({
            "organization_name": org_name,
            "plan_name": sub.plan_name,
            "reports_used": sub.reports_used,
            "report_limit": sub.report_limit,
            "transcriptions_used": sub.transcriptions_used,
            "transcription_limit": sub.transcription_limit,
            "status": sub.status
        })

    return result


@router.get("/upgrade-requests")
def get_upgrade_requests(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    if current_user.role != "super_admin":
        return {"detail": "Access denied"}

    return db.query(UpgradeRequest).all()


from fastapi import HTTPException

@router.put("/upgrade-requests/{request_id}/approve")
def approve_request(
    request_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    if current_user.role != "super_admin":
        raise HTTPException(
            status_code=403,
            detail="Access denied"
        )

    request = db.query(
        UpgradeRequest
    ).filter(
        UpgradeRequest.request_id == request_id
    ).first()

    if not request:
        raise HTTPException(
            status_code=404,
            detail="Request not found"
        )

    request.status = "approved"

    db.commit()
    db.refresh(request)

    return request




class UpgradeRequestCreate(BaseModel):
    organization_id: str
    current_plan: str
    requested_plan: str
    message: str


@router.post("/upgrade-requests")
def create_upgrade_request(
    payload: UpgradeRequestCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    request = UpgradeRequest(
        organization_id=payload.organization_id,
        current_plan=payload.current_plan,
        requested_plan=payload.requested_plan,
        message=payload.message
    )

    db.add(request)
    db.commit()
    db.refresh(request)

    return request



@router.get("/dashboard")
def get_dashboard(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    if current_user.role != "super_admin":
        raise HTTPException(
            status_code=403,
            detail="Access denied"
        )

    organizations = db.query(Organization).count()

    doctors = db.query(User).filter(
        User.role == "practitioner"
    ).count()

    patients = db.query(Patient).count()

    subscriptions = db.query(
        OrganizationSubscription
    ).count()

    pending_requests = db.query(
        UpgradeRequest
    ).filter(
        UpgradeRequest.status == "pending"
    ).count()

    return {
        "organizations": organizations,
        "doctors": doctors,
        "patients": patients,
        "subscriptions": subscriptions,
        "pending_upgrade_requests": pending_requests
    }