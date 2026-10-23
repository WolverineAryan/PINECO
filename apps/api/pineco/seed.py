import hashlib
import json
from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session

from pineco.config import settings
from pineco.database import SessionLocal, Base, engine
from pineco.models import (
    Product,
    BrandRule,
    ApprovedFact,
    Submission,
    ContentVersion,
    Review,
    Finding,
    ReviewDecision,
    AuditEvent,
    User,
    get_utc_now,
)
from pineco.auth import hash_password, DEMO_USERS


def calculate_sha256(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


PRODUCTS_DATA = [
    {
        "id": "prod-pineco-core",
        "name": "Pineco Core Cloud",
        "description": "Flagship AI Brand Governance, Claim Verification & Pre-Publication Control Plane",
        "category": "Enterprise Cloud",
    },
    {
        "id": "prod-fintech-alpha",
        "name": "AlphaVault Institutional Liquidity",
        "description": "Autonomous algorithmic treasury management with real-time settlement and liquidity pooling",
        "category": "FinTech & Wealth",
    },
    {
        "id": "prod-health-cardio",
        "name": "CardioPulse BioMonitor",
        "description": "FDA Class II continuous remote cardiac telemetry sensor and arrhythmia detection suite",
        "category": "MedTech & Health",
    },
    {
        "id": "prod-saas-mesh",
        "name": "CloudMesh Distributed Gateway",
        "description": "Zero-trust API proxy and multi-region service mesh offering sub-millisecond edge routing",
        "category": "Cloud Infrastructure",
    },
    {
        "id": "prod-pharma-oncology",
        "name": "OncoGenix Precision Therapeutics",
        "description": "Targeted mRNA immunotherapeutic compounds undergoing Phase III multi-center clinical trials",
        "category": "Pharma & Biotech",
    },
    {
        "id": "prod-cyber-aegis",
        "name": "AegisZero Post-Quantum Enclave",
        "description": "Lattice-based cryptography hardware security module with FIPS 140-3 Level 4 validation",
        "category": "Cybersecurity",
    },
    {
        "id": "prod-retail-green",
        "name": "VerdePack Circular Polymers",
        "description": "85% certified post-consumer ocean-bound plastic packaging with certified LCA decarbonization",
        "category": "Consumer Packaging",
    },
    {
        "id": "prod-bank-apex",
        "name": "ApexPay Real-Time Settlement",
        "description": "Instant cross-border B2B clearing protocol operating over FedNow and RTP networks",
        "category": "Digital Banking",
    },
    {
        "id": "prod-auto-drive",
        "name": "NeuroDrive L4 Autonomous Fleet",
        "description": "Vision-first foundation driving model for municipal autonomous commercial transit shuttles",
        "category": "Robotics & Mobility",
    },
    {
        "id": "prod-insur-claim",
        "name": "ClaimGuard Underwriting Engine",
        "description": "Predictive actuarial property and casualty underwriting engine with real-time catastrophe modelling",
        "category": "InsurTech",
    },
    {
        "id": "prod-crypto-titan",
        "name": "TitanVault MPC Custody",
        "description": "Institutional multi-party computation cold storage engine with qualified custodian segregation",
        "category": "Digital Assets",
    },
    {
        "id": "prod-edu-tutor",
        "name": "CognitiveTutor Adaptive Classroom",
        "description": "Personalized Socratic AI pedagogy companion engineered for accredited university curricula",
        "category": "EdTech",
    },
    {
        "id": "prod-telecom-5g",
        "name": "Horizon5G Carrier Virtualization",
        "description": "Open-RAN compatible vDU and vCU software suite enabling private industrial edge networks",
        "category": "Telecommunications",
    },
    {
        "id": "prod-space-orbit",
        "name": "OrbitLink Low-Earth Telemetry",
        "description": "Laser optical inter-satellite cross-link transceivers operating in polar sun-synchronous orbits",
        "category": "Aerospace & Defense",
    },
    {
        "id": "prod-legal-lexis",
        "name": "LexisTrust Statutory Discovery",
        "description": "Privileged regulatory document discovery engine with automatic redline and compliance lineage",
        "category": "LegalTech",
    },
    {
        "id": "prod-energy-grid",
        "name": "VoltSync Virtual Grid Power Plant",
        "description": "Distributed commercial battery energy storage dispatch coordinator with automated frequency regulation",
        "category": "CleanTech Energy",
    },
]


def seed_database(db: Session) -> None:
    """Populates repeatable seed data for demo workspace with 16 enterprise products."""
    workspace_id = settings.DEFAULT_WORKSPACE_ID
    now = get_utc_now()

    # Clear existing demo workspace records to ensure clean repeatable state
    db.query(AuditEvent).filter(AuditEvent.workspace_id == workspace_id).delete()
    sub_ids = [s.id for s in db.query(Submission).filter(Submission.workspace_id == workspace_id).all()]
    if sub_ids:
        db.query(ReviewDecision).filter(ReviewDecision.submission_id.in_(sub_ids)).delete(synchronize_session=False)
        review_ids = [r.id for r in db.query(Review).filter(Review.submission_id.in_(sub_ids)).all()]
        if review_ids:
            db.query(Finding).filter(Finding.review_id.in_(review_ids)).delete(synchronize_session=False)
            db.query(Review).filter(Review.id.in_(review_ids)).delete(synchronize_session=False)
        db.query(ContentVersion).filter(ContentVersion.submission_id.in_(sub_ids)).delete(synchronize_session=False)
        db.query(Submission).filter(Submission.id.in_(sub_ids)).delete(synchronize_session=False)
    db.query(BrandRule).filter(BrandRule.workspace_id == workspace_id).delete()
    db.query(ApprovedFact).filter(ApprovedFact.workspace_id == workspace_id).delete()
    db.query(Product).filter(Product.workspace_id == workspace_id).delete()
    db.commit()

    # 1. Seed 16 Distinct Enterprise Products
    for p_info in PRODUCTS_DATA:
        p_obj = Product(
            id=p_info["id"],
            workspace_id=workspace_id,
            name=p_info["name"],
            description=p_info["description"],
            category=p_info["category"],
            created_by=settings.DEFAULT_USER_ADMIN,
            created_at=now - timedelta(days=90),
            updated_at=now - timedelta(days=2),
        )
        db.add(p_obj)
    db.commit()

    # 2. Seed Default Demo Users for Real JWT Auth
    for user_key, u_data in DEMO_USERS.items():
        existing = db.query(User).filter(User.email == u_data["email"]).first()
        if not existing:
            default_user = User(
                id=u_data["id"],
                workspace_id=workspace_id,
                email=u_data["email"],
                password_hash=hash_password("pineco2026!"),
                name=u_data["name"],
                role=u_data["role"],
                title=u_data.get("title", "Governance Specialist"),
                department=u_data.get("department", "Enterprise"),
            )
            db.add(default_user)
        else:
            existing.password_hash = hash_password("pineco2026!")
            existing.role = u_data["role"]
            existing.name = u_data["name"]
    db.commit()

    # 3. Seed Comprehensive Brand Rules
    rules = [
        # Pineco Core Rules
        BrandRule(
            id="rule-demo-001",
            workspace_id=workspace_id,
            product_id="prod-pineco-core",
            name="Prohibited Absolute Claim: 'guaranteed results'",
            category="terminology",
            description="Brand policy prohibits absolute performance guarantees in marketing and public copy.",
            pattern=r"\bguaranteed results\b",
            preferred_replacement="proven approach",
            severity="high",
            channel_scope="all",
            enabled=True,
            version=1,
            created_by=settings.DEFAULT_USER_MANAGER,
        ),
        BrandRule(
            id="rule-demo-002",
            workspace_id=workspace_id,
            product_id="prod-pineco-core",
            name="Prohibited Value Term: 'cheap'",
            category="terminology",
            description="Use value-oriented positioning rather than terms implying inferior quality.",
            pattern=r"\bcheap\b",
            preferred_replacement="cost-effective",
            severity="medium",
            channel_scope="all",
            enabled=True,
            version=1,
            created_by=settings.DEFAULT_USER_MANAGER,
        ),
        BrandRule(
            id="rule-demo-003",
            workspace_id=workspace_id,
            product_id="prod-pineco-core",
            name="Mandatory Forward-Looking Disclaimer",
            category="disclaimer",
            description="All promotional copy mentioning projections must include the approved safe harbor clause.",
            pattern=r"\bPast performance is not indicative of future results\b",
            preferred_replacement=None,
            severity="high",
            channel_scope="all",
            enabled=True,
            version=1,
            created_by=settings.DEFAULT_USER_MANAGER,
        ),
        # FinTech AlphaVault Rules
        BrandRule(
            id="rule-fintech-001",
            workspace_id=workspace_id,
            product_id="prod-fintech-alpha",
            name="SEC 206(4)-1: Prohibited 'Risk-Free' Claims",
            category="terminology",
            description="SEC and FINRA strictly prohibit describing yield instruments or investment returns as risk-free.",
            pattern=r"\b(risk-free|guaranteed returns|zero risk)\b",
            preferred_replacement="variable yield subject to capital risk",
            severity="high",
            channel_scope="all",
            enabled=True,
            version=1,
            created_by=settings.DEFAULT_USER_MANAGER,
        ),
        BrandRule(
            id="rule-fintech-002",
            workspace_id=workspace_id,
            product_id="prod-fintech-alpha",
            name="FINRA 2210: Mandatory Liquidity Disclaimers",
            category="disclaimer",
            description="Marketing must disclose that liquidity availability is contingent on partner counterparty settlement.",
            pattern=r"\bLiquidity availability subject to counterparty clearing settlement\b",
            preferred_replacement=None,
            severity="high",
            channel_scope="all",
            enabled=True,
            version=1,
            created_by=settings.DEFAULT_USER_MANAGER,
        ),
        # Healthcare CardioPulse Rules
        BrandRule(
            id="rule-health-001",
            workspace_id=workspace_id,
            product_id="prod-health-cardio",
            name="FDA 21 CFR §801: Prohibited 'Diagnostic Cure' Claims",
            category="terminology",
            description="Class II wearable monitor is for remote physiological telemetry, not primary diagnostic cure.",
            pattern=r"\b(cures arrhythmias|guarantees diagnosis|replaces emergency room)\b",
            preferred_replacement="aids in clinical telemetry tracking",
            severity="high",
            channel_scope="all",
            enabled=True,
            version=1,
            created_by=settings.DEFAULT_USER_MANAGER,
        ),
        BrandRule(
            id="rule-health-002",
            workspace_id=workspace_id,
            product_id="prod-health-cardio",
            name="FDA Statutory Cautionary Labeling",
            category="disclaimer",
            description="Must include FDA Caution: Investigational device tracking subject to clinical physician supervision.",
            pattern=r"\bCaution: Device is intended for remote monitoring under clinical supervision\b",
            preferred_replacement=None,
            severity="high",
            channel_scope="all",
            enabled=True,
            version=1,
            created_by=settings.DEFAULT_USER_MANAGER,
        ),
        # CloudMesh SaaS Rules
        BrandRule(
            id="rule-saas-001",
            workspace_id=workspace_id,
            product_id="prod-saas-mesh",
            name="SOC 2 Type II: Prohibited '100% Uptime' Guarantee",
            category="terminology",
            description="SLA ground truth certifies 99.99% uptime. Absolute 100% claims violate customer master agreements.",
            pattern=r"\b(100% uptime|zero downtime forever)\b",
            preferred_replacement="certified 99.99% multi-region uptime SLA",
            severity="high",
            channel_scope="all",
            enabled=True,
            version=1,
            created_by=settings.DEFAULT_USER_MANAGER,
        ),
        # Retail Packaging Rules
        BrandRule(
            id="rule-retail-001",
            workspace_id=workspace_id,
            product_id="prod-retail-green",
            name="FTC 16 CFR §255: Unqualified Eco Claims",
            category="terminology",
            description="FTC Green Guides prohibit unqualified environmental statements like '100% eco-friendly' or 'miraculous'.",
            pattern=r"\b(100% eco-friendly|zero carbon footprint|completely green)\b",
            preferred_replacement="85% post-consumer recycled polymer certified by ISO 14044",
            severity="high",
            channel_scope="all",
            enabled=True,
            version=1,
            created_by=settings.DEFAULT_USER_MANAGER,
        ),
        # Autonomous NeuroDrive Rules
        BrandRule(
            id="rule-auto-001",
            workspace_id=workspace_id,
            product_id="prod-auto-drive",
            name="NHTSA SAE J3016: Prohibited 'Self-Driving' Absolute",
            category="terminology",
            description="NHTSA orders forbid advertising Level 4 driver-assist as autonomous without licensed commercial ODD disclaimers.",
            pattern=r"\b(fully driverless everywhere|hands-off forever)\b",
            preferred_replacement="Level 4 autonomous shuttle operating within defined operational design domains",
            severity="high",
            channel_scope="all",
            enabled=True,
            version=1,
            created_by=settings.DEFAULT_USER_MANAGER,
        ),
        # InsurTech Rules
        BrandRule(
            id="rule-insur-001",
            workspace_id=workspace_id,
            product_id="prod-insur-claim",
            name="NAIC State Insurance: Prohibited 'Immediate Claim Approval'",
            category="terminology",
            description="State insurance departments forbid guaranteeing automated payout approval before formal actuarial review.",
            pattern=r"\b(instant guaranteed payout|claims always paid)\b",
            preferred_replacement="automated claims assessment subject to policy terms",
            severity="high",
            channel_scope="all",
            enabled=True,
            version=1,
            created_by=settings.DEFAULT_USER_MANAGER,
        ),
        # Crypto TitanVault Rules
        BrandRule(
            id="rule-crypto-001",
            workspace_id=workspace_id,
            product_id="prod-crypto-titan",
            name="NYDFS BitLicense: Mandatory Cold Storage Disclosures",
            category="disclaimer",
            description="All digital asset marketing must disclose that assets are segregated with a Qualified Custodian.",
            pattern=r"\bDigital assets held in segregated bankruptcy-remote cold storage\b",
            preferred_replacement=None,
            severity="high",
            channel_scope="all",
            enabled=True,
            version=1,
            created_by=settings.DEFAULT_USER_MANAGER,
        ),
    ]
    db.add_all(rules)
    db.commit()

    # 4. Seed Approved Facts in Knowledge Base
    facts = [
        ApprovedFact(
            id="fact-core-001",
            workspace_id=workspace_id,
            product_id="prod-pineco-core",
            statement="Pineco reduces enterprise compliance turnaround times by up to 68% across distributed marketing teams.",
            source_title="Enterprise Benchmark & Value Report 2026",
            source_reference="REP-2026-68",
            source_url="https://docs.pineco.internal/reports/benchmark-2026",
            owner="Product Marketing",
            approval_status="approved",
            valid_from=now - timedelta(days=60),
            valid_until=now + timedelta(days=365),
            created_by=settings.DEFAULT_USER_MANAGER,
        ),
        ApprovedFact(
            id="fact-core-002",
            workspace_id=workspace_id,
            product_id="prod-pineco-core",
            statement="Pineco deterministic policy pre-checks execute in less than 0.04 seconds using Unicode-normalized regex matching.",
            source_title="Core Engine Latency Benchmark Suite",
            source_reference="ENG-LATENCY-040",
            source_url="https://docs.pineco.internal/architecture/latency",
            owner="Platform Engineering",
            approval_status="approved",
            valid_from=now - timedelta(days=90),
            valid_until=now + timedelta(days=730),
            created_by=settings.DEFAULT_USER_MANAGER,
        ),
        ApprovedFact(
            id="fact-fintech-001",
            workspace_id=workspace_id,
            product_id="prod-fintech-alpha",
            statement="AlphaVault maintains $1.2B in Tier-1 liquidity reserve backstops backed by short-dated US Treasury bills.",
            source_title="Q3 Independent Attestation Report by BDO",
            source_reference="BDO-ATT-2026-Q3",
            source_url="https://alphavault.internal/attestations/q3",
            owner="Treasury Operations",
            approval_status="approved",
            valid_from=now - timedelta(days=30),
            valid_until=now + timedelta(days=180),
            created_by=settings.DEFAULT_USER_MANAGER,
        ),
        ApprovedFact(
            id="fact-health-001",
            workspace_id=workspace_id,
            product_id="prod-health-cardio",
            statement="CardioPulse BioMonitor demonstrated 99.4% atrial fibrillation episode sensitivity in 1,200-patient multi-center clinical trials.",
            source_title="FDA 510(k) Clinical Submission K240981",
            source_reference="FDA-510K-K240981",
            source_url="https://clinicaltrials.gov/ct2/show/NCT05912401",
            owner="Regulatory Affairs",
            approval_status="approved",
            valid_from=now - timedelta(days=120),
            valid_until=now + timedelta(days=1095),
            created_by=settings.DEFAULT_USER_MANAGER,
        ),
        ApprovedFact(
            id="fact-saas-001",
            workspace_id=workspace_id,
            product_id="prod-saas-mesh",
            statement="CloudMesh Distributed Gateway is audited under SOC 2 Type II with 99.99% availability across 42 global edge availability zones.",
            source_title="EY SOC 2 Type II Final Report 2026",
            source_reference="SOC2-EY-2026-04",
            source_url="https://trust.cloudmesh.internal/soc2",
            owner="Information Security",
            approval_status="approved",
            valid_from=now - timedelta(days=45),
            valid_until=now + timedelta(days=365),
            created_by=settings.DEFAULT_USER_MANAGER,
        ),
        ApprovedFact(
            id="fact-retail-001",
            workspace_id=workspace_id,
            product_id="prod-retail-green",
            statement="VerdePack Circular Polymers reduce lifecycle carbon emissions by 34% compared to virgin petrochemical resin.",
            source_title="ISO 14044 Third-Party Life Cycle Assessment",
            source_reference="LCA-SGS-2026-88",
            source_url="https://verdepack.internal/lca-report",
            owner="Sustainability Committee",
            approval_status="approved",
            valid_from=now - timedelta(days=180),
            valid_until=now + timedelta(days=365),
            created_by=settings.DEFAULT_USER_MANAGER,
        ),
        ApprovedFact(
            id="fact-pharma-001",
            workspace_id=workspace_id,
            product_id="prod-pharma-oncology",
            statement="OncoGenix precision mRNA formulation demonstrated an 82% progression-free survival rate in Phase II clinical cohort studies.",
            source_title="New England Journal of Oncology Protocol ONC-992",
            source_reference="NEJO-2026-ONC992",
            source_url="https://clinical.oncogenix.internal/study-992",
            owner="Medical Affairs",
            approval_status="approved",
            valid_from=now - timedelta(days=90),
            valid_until=now + timedelta(days=730),
            created_by=settings.DEFAULT_USER_MANAGER,
        ),
        ApprovedFact(
            id="fact-cyber-001",
            workspace_id=workspace_id,
            product_id="prod-cyber-aegis",
            statement="AegisZero implements Kyber-1024 and Dilithium NIST post-quantum cryptographic standards with FIPS 140-3 Level 4 physical tamper boundaries.",
            source_title="NIST Post-Quantum Cryptographic Validation Certificate #991",
            source_reference="NIST-PQC-991",
            source_url="https://csrc.nist.gov/projects/pqc",
            owner="Cryptographic Research",
            approval_status="approved",
            valid_from=now - timedelta(days=30),
            valid_until=now + timedelta(days=1095),
            created_by=settings.DEFAULT_USER_MANAGER,
        ),
        ApprovedFact(
            id="fact-bank-001",
            workspace_id=workspace_id,
            product_id="prod-bank-apex",
            statement="ApexPay processes institutional cross-border settlements with end-to-end clearing latency under 1.8 seconds over FedNow rails.",
            source_title="Federal Reserve Financial Services FedNow Integration Certificate",
            source_reference="FRFS-FEDNOW-APEX",
            source_url="https://frbservices.org/fednow",
            owner="Payments Compliance",
            approval_status="approved",
            valid_from=now - timedelta(days=15),
            valid_until=now + timedelta(days=365),
            created_by=settings.DEFAULT_USER_MANAGER,
        ),
    ]
    db.add_all(facts)
    db.commit()

    # 5. Seed Real Submissions Across Products with Verifiable Versions, Reviews, & Decisions
    demo_submissions = [
        # 1. Pineco Core Approved Press Release
        {
            "id": "sub-core-approved",
            "product_id": "prod-pineco-core",
            "title": "Enterprise Brand Governance Launch Press Release",
            "channel": "press_release",
            "created_by": settings.DEFAULT_USER_CREATOR,
            "status": "approved",
            "created_offset": timedelta(hours=6),
            "updated_offset": timedelta(hours=2),
            "text": (
                "Pineco delivers a proven approach to automated enterprise brand governance. "
                "Pineco reduces enterprise compliance turnaround times by up to 68% across distributed marketing teams. "
                "Our deterministic policy pre-checks execute in less than 0.04 seconds using Unicode-normalized regex matching. "
                "Past performance is not indicative of future results."
            ),
            "decision": "approved",
            "rationale": "All regulatory disclaimers verified. Quantitative speed and turnaround metrics match approved 2026 benchmark certificates.",
            "reviewer": settings.DEFAULT_USER_REVIEWER,
        },
        # 2. FinTech High-Yield Marketing Campaign (Changes Requested)
        {
            "id": "sub-fintech-violations",
            "product_id": "prod-fintech-alpha",
            "title": "AlphaVault Institutional Liquidity Social Campaign",
            "channel": "social",
            "created_by": settings.DEFAULT_USER_CREATOR,
            "status": "changes_requested",
            "created_offset": timedelta(hours=3),
            "updated_offset": timedelta(minutes=45),
            "text": (
                "Earn completely risk-free 14% annual returns on enterprise liquidity with AlphaVault! "
                "AlphaVault guarantees immediate cash withdrawal with zero market volatility. "
                "Sign up now before high-yield pools close permanently."
            ),
            "decision": "rejected",
            "rationale": "Severe SEC Rule 206(4)-1 violation. Term 'risk-free' strictly illegal for liquidity pools. Missing mandatory counterparty clearing disclosure.",
            "reviewer": settings.DEFAULT_USER_REVIEWER,
            "findings": [
                {
                    "category": "terminology",
                    "severity": "high",
                    "excerpt": "Earn completely risk-free 14% annual returns...",
                    "explanation": "SEC Rule 206(4)-1 strictly forbids advertising yields as risk-free.",
                    "rule_id": "rule-fintech-001",
                    "suggested_correction": "Replace 'risk-free' with 'variable yield subject to market risk'.",
                },
                {
                    "category": "disclaimer",
                    "severity": "high",
                    "excerpt": "Missing mandatory clearing disclaimer.",
                    "explanation": "FINRA 2210 requires clear disclosure regarding partner counterparty clearing times.",
                    "rule_id": "rule-fintech-002",
                    "suggested_correction": "Append: 'Liquidity availability subject to counterparty clearing settlement.'",
                },
            ],
        },
        # 3. CardioPulse Clinical Product Brief (In Review)
        {
            "id": "sub-health-inreview",
            "product_id": "prod-health-cardio",
            "title": "CardioPulse BioMonitor Hospital Clinician One-Pager",
            "channel": "website",
            "created_by": settings.DEFAULT_USER_CREATOR,
            "status": "in_review",
            "created_offset": timedelta(hours=1, minutes=30),
            "updated_offset": timedelta(minutes=15),
            "text": (
                "CardioPulse BioMonitor demonstrated 99.4% atrial fibrillation episode sensitivity in 1,200-patient multi-center clinical trials. "
                "Continuous remote cardiac telemetry provides actionable physiological insights for electrophysiology teams. "
                "Caution: Device is intended for remote monitoring under clinical supervision."
            ),
            "decision": None,
            "reviewer": None,
        },
        # 4. CloudMesh SLA Announcement (Approved)
        {
            "id": "sub-saas-approved",
            "product_id": "prod-saas-mesh",
            "title": "CloudMesh Global Edge 99.99% SLA Upgrade Notice",
            "channel": "blog",
            "created_by": settings.DEFAULT_USER_CREATOR,
            "status": "approved",
            "created_offset": timedelta(days=1),
            "updated_offset": timedelta(hours=18),
            "text": (
                "CloudMesh Distributed Gateway is audited under SOC 2 Type II with 99.99% availability across 42 global edge availability zones. "
                "Deploy microservice security policies in milliseconds with cryptographic TLS 1.3 mutual authentication."
            ),
            "decision": "approved",
            "rationale": "Verified against EY SOC 2 Type II Report #SOC2-EY-2026-04. Exact SLA claim conforms to master agreement.",
            "reviewer": settings.DEFAULT_USER_REVIEWER,
        },
        # 5. VerdePack Sustainability Whitepaper (Changes Requested)
        {
            "id": "sub-retail-changes",
            "product_id": "prod-retail-green",
            "title": "VerdePack Ocean Circularity ESG Whitepaper Draft",
            "channel": "website",
            "created_by": settings.DEFAULT_USER_CREATOR,
            "status": "changes_requested",
            "created_offset": timedelta(hours=5),
            "updated_offset": timedelta(hours=1),
            "text": (
                "Our revolutionary packaging has a 100% eco-friendly zero carbon footprint and will save all marine life forever! "
                "VerdePack Circular Polymers reduce lifecycle carbon emissions by 34% compared to virgin petrochemical resin."
            ),
            "decision": "changes_requested",
            "rationale": "FTC Green Guides violation for unqualified phrase '100% eco-friendly zero carbon footprint'. Replace with certified ISO 14044 metrics.",
            "reviewer": settings.DEFAULT_USER_REVIEWER,
            "findings": [
                {
                    "category": "terminology",
                    "severity": "high",
                    "excerpt": "100% eco-friendly zero carbon footprint",
                    "explanation": "Unqualified environmental statement prohibited by FTC 16 CFR §255.",
                    "rule_id": "rule-retail-001",
                    "suggested_correction": "State specific ISO 14044 certified 34% reduction instead of generic zero footprint.",
                }
            ],
        },
        # 6. AegisZero Cryptographic Security Advisory (Approved)
        {
            "id": "sub-cyber-approved",
            "product_id": "prod-cyber-aegis",
            "title": "AegisZero Post-Quantum Migration Technical Brief",
            "channel": "press_release",
            "created_by": settings.DEFAULT_USER_CREATOR,
            "status": "approved",
            "created_offset": timedelta(days=2),
            "updated_offset": timedelta(days=1),
            "text": (
                "AegisZero implements Kyber-1024 and Dilithium NIST post-quantum cryptographic standards with FIPS 140-3 Level 4 physical tamper boundaries. "
                "Protect mission-critical banking and government communications against future decryption threats."
            ),
            "decision": "approved",
            "rationale": "Cross-referenced with NIST Certificate #991. Fully compliant with enterprise security marketing standards.",
            "reviewer": settings.DEFAULT_USER_REVIEWER,
        },
        # 7. ApexPay FedNow Launch (In Review)
        {
            "id": "sub-bank-inreview",
            "product_id": "prod-bank-apex",
            "title": "ApexPay FedNow Instant Clearing Announcement",
            "channel": "press_release",
            "created_by": settings.DEFAULT_USER_CREATOR,
            "status": "in_review",
            "created_offset": timedelta(hours=2),
            "updated_offset": timedelta(minutes=30),
            "text": (
                "ApexPay processes institutional cross-border settlements with end-to-end clearing latency under 1.8 seconds over FedNow rails. "
                "Direct Federal Reserve participant banking network integration."
            ),
            "decision": None,
            "reviewer": None,
        },
        # 8. NeuroDrive Autonomous Transit Case Study (Approved)
        {
            "id": "sub-auto-approved",
            "product_id": "prod-auto-drive",
            "title": "NeuroDrive Municipal Shuttle Deployment Case Study",
            "channel": "blog",
            "created_by": settings.DEFAULT_USER_CREATOR,
            "status": "approved",
            "created_offset": timedelta(days=3),
            "updated_offset": timedelta(days=2),
            "text": (
                "NeuroDrive operates as a Level 4 autonomous shuttle operating within defined operational design domains across municipal commercial corridors. "
                "Continuous remote fleet supervisor oversight maintained 24/7."
            ),
            "decision": "approved",
            "rationale": "Adheres strictly to NHTSA SAE J3016 classification standards. Zero misleading automated driving assertions.",
            "reviewer": settings.DEFAULT_USER_REVIEWER,
        },
        # 9. OncoGenix Oncology Trial Update (In Review)
        {
            "id": "sub-pharma-inreview",
            "product_id": "prod-pharma-oncology",
            "title": "OncoGenix Phase II Progression-Free Survival Clinical Update",
            "channel": "press_release",
            "created_by": settings.DEFAULT_USER_CREATOR,
            "status": "in_review",
            "created_offset": timedelta(hours=4),
            "updated_offset": timedelta(hours=1),
            "text": (
                "OncoGenix precision mRNA formulation demonstrated an 82% progression-free survival rate in Phase II clinical cohort studies. "
                "Data presented at the Annual Society of Clinical Oncology Symposium."
            ),
            "decision": None,
            "reviewer": None,
        },
        # 10. TitanVault Digital Asset Custody Disclosure (Approved)
        {
            "id": "sub-crypto-approved",
            "product_id": "prod-crypto-titan",
            "title": "TitanVault Institutional Custody Security Overview",
            "channel": "website",
            "created_by": settings.DEFAULT_USER_CREATOR,
            "status": "approved",
            "created_offset": timedelta(days=4),
            "updated_offset": timedelta(days=3),
            "text": (
                "TitanVault secures sovereign digital assets using multi-party computation threshold schemes. "
                "Digital assets held in segregated bankruptcy-remote cold storage."
            ),
            "decision": "approved",
            "rationale": "NYDFS compliance checklist passed. Qualified custody segregation clause confirmed.",
            "reviewer": settings.DEFAULT_USER_REVIEWER,
        },
        # 11. ClaimGuard Actuarial Underwriting Platform Brief (Approved)
        {
            "id": "sub-insur-approved",
            "product_id": "prod-insur-claim",
            "title": "ClaimGuard Commercial Property Underwriting Overview",
            "channel": "website",
            "created_by": settings.DEFAULT_USER_CREATOR,
            "status": "approved",
            "created_offset": timedelta(days=2, hours=4),
            "updated_offset": timedelta(days=1, hours=1),
            "text": (
                "ClaimGuard underwrites commercial property risks using real-time catastrophe models verified against certified actuarial loss records. "
                "All policies subject to underwriting eligibility and statutory state insurance filing approval."
            ),
            "decision": "approved",
            "rationale": "State statutory insurance filing disclosures confirmed. Actuarial modeling statements verified against certified loss records.",
            "reviewer": settings.DEFAULT_USER_REVIEWER,
        },
        # 12. CognitiveTutor University AI Curriculum Guide (In Review)
        {
            "id": "sub-edu-inreview",
            "product_id": "prod-edu-tutor",
            "title": "CognitiveTutor Higher-Ed Adaptive Pedagogy Guide",
            "channel": "blog",
            "created_by": settings.DEFAULT_USER_CREATOR,
            "status": "in_review",
            "created_offset": timedelta(hours=5),
            "updated_offset": timedelta(hours=2),
            "text": (
                "CognitiveTutor provides adaptive Socratic dialogue support for university STEM faculty. "
                "The platform complies fully with FERPA student privacy regulations and does not use student submissions for model retraining."
            ),
            "decision": None,
            "reviewer": None,
        },
        # 13. Horizon5G Carrier Private Cellular Release (Changes Requested)
        {
            "id": "sub-telecom-changes",
            "product_id": "prod-telecom-5g",
            "title": "Horizon5G Industrial Private Cellular Deployment PR",
            "channel": "press_release",
            "created_by": settings.DEFAULT_USER_CREATOR,
            "status": "changes_requested",
            "created_offset": timedelta(hours=7),
            "updated_offset": timedelta(hours=3),
            "text": (
                "Horizon5G delivers infinite wireless bandwidth with absolute 100% zero packet loss for industrial robotics facilities! "
                "Guaranteed to eliminate all network downtime forever across enterprise factory floors."
            ),
            "decision": "changes_requested",
            "rationale": "Prohibited absolute terms 'infinite wireless bandwidth', '100% zero packet loss', and 'eliminate all network downtime forever'. Replace with certified SLA benchmarks.",
            "reviewer": settings.DEFAULT_USER_REVIEWER,
            "findings": [
                {
                    "category": "terminology",
                    "severity": "high",
                    "excerpt": "infinite wireless bandwidth with absolute 100% zero packet loss",
                    "explanation": "Absolute reliability and bandwidth claims violate brand governance standards.",
                    "rule_id": "rule-demo-001",
                    "suggested_correction": "Specify verified 99.999% packet delivery SLA benchmark.",
                }
            ],
        },
        # 14. OrbitLink Inter-Satellite Optical Cross-Link Whitepaper (Approved)
        {
            "id": "sub-space-approved",
            "product_id": "prod-space-orbit",
            "title": "OrbitLink Optical Cross-Link Technical Specifications",
            "channel": "website",
            "created_by": settings.DEFAULT_USER_CREATOR,
            "status": "approved",
            "created_offset": timedelta(days=3, hours=8),
            "updated_offset": timedelta(days=2, hours=12),
            "text": (
                "OrbitLink inter-satellite cross-links achieve 100 Gbps optical transmission in sun-synchronous polar orbits. "
                "Compliant with ITU spectrum allocations and orbital debris mitigation guidelines."
            ),
            "decision": "approved",
            "rationale": "ITU spectrum and orbital compliance references verified by aerospace engineering.",
            "reviewer": settings.DEFAULT_USER_REVIEWER,
        },
        # 15. LexisTrust Privileged Document Review Technical Memo (Approved)
        {
            "id": "sub-legal-approved",
            "product_id": "prod-legal-lexis",
            "title": "LexisTrust Statutory Privilege Classification Memo",
            "channel": "internal",
            "created_by": settings.DEFAULT_USER_CREATOR,
            "status": "approved",
            "created_offset": timedelta(days=1, hours=6),
            "updated_offset": timedelta(hours=14),
            "text": (
                "LexisTrust accelerates regulatory compliance document discovery with deterministic privilege classification and end-to-end cryptographic audit trails. "
                "This technical brief does not constitute formal legal counsel or create an attorney-client relationship."
            ),
            "decision": "approved",
            "rationale": "Non-legal counsel disclaimer attached. Privilege classification metrics confirmed.",
            "reviewer": settings.DEFAULT_USER_REVIEWER,
        },
        # 16. VoltSync Distributed Battery Grid Dispatch Report (In Review)
        {
            "id": "sub-energy-inreview",
            "product_id": "prod-energy-grid",
            "title": "VoltSync Commercial Battery Grid Dispatch Performance",
            "channel": "blog",
            "created_by": settings.DEFAULT_USER_CREATOR,
            "status": "in_review",
            "created_offset": timedelta(hours=8),
            "updated_offset": timedelta(hours=4),
            "text": (
                "VoltSync aggregates 45 MW of commercial battery storage assets for automated regional grid frequency stabilization. "
                "Interconnection agreements executed with certified regional transmission operators."
            ),
            "decision": None,
            "reviewer": None,
        },
        # 17. Pineco Core Disclaimers Feature Announcement (Changes Requested)
        {
            "id": "sub-core-revisions",
            "product_id": "prod-pineco-core",
            "title": "Pineco Automated Regulatory Disclaimer Engine Social Blast",
            "channel": "social",
            "created_by": settings.DEFAULT_USER_CREATOR,
            "status": "changes_requested",
            "created_offset": timedelta(hours=9),
            "updated_offset": timedelta(hours=2),
            "text": (
                "Never worry about compliance again! Pineco guarantees you will never be fined by any regulatory agency in the world with our magic AI software. "
                "Eliminate all human lawyers today."
            ),
            "decision": "changes_requested",
            "rationale": "Extreme brand violation: absolute promise 'guarantees you will never be fined' and disparaging language 'eliminate all human lawyers'.",
            "reviewer": settings.DEFAULT_USER_REVIEWER,
            "findings": [
                {
                    "category": "terminology",
                    "severity": "high",
                    "excerpt": "guarantees you will never be fined by any regulatory agency in the world",
                    "explanation": "Absolute liability exclusion promise prohibited under enterprise risk guidelines.",
                    "rule_id": "rule-demo-001",
                    "suggested_correction": "Replace with 'Pineco helps mitigate regulatory compliance risk across marketing workflows'.",
                }
            ],
        },
        # 18. AlphaVault Treasury Cash Management Compliance Note (Approved)
        {
            "id": "sub-fintech-approved",
            "product_id": "prod-fintech-alpha",
            "title": "AlphaVault Treasury Repo Collateralization Compliance Brief",
            "channel": "email",
            "created_by": settings.DEFAULT_USER_CREATOR,
            "status": "approved",
            "created_offset": timedelta(days=2),
            "updated_offset": timedelta(hours=16),
            "text": (
                "AlphaVault institutional liquidity accounts provide overnight repo collateralization backed by short-dated Tier-1 US Treasuries. "
                "Past performance is not indicative of future results. Yields are variable and subject to capital market fluctuations."
            ),
            "decision": "approved",
            "rationale": "SEC Rule 206(4)-1 disclaimer included. Tier-1 Treasury collateralization matches independent BDO attestation.",
            "reviewer": settings.DEFAULT_USER_REVIEWER,
        },
        # 19. CardioPulse FDA 510(k) Clearance Regulatory Press Release (Approved)
        {
            "id": "sub-health-approved",
            "product_id": "prod-health-cardio",
            "title": "CardioPulse FDA 510(k) Regulatory Clearance Announcement",
            "channel": "press_release",
            "created_by": settings.DEFAULT_USER_CREATOR,
            "status": "approved",
            "created_offset": timedelta(days=1, hours=12),
            "updated_offset": timedelta(hours=8),
            "text": (
                "CardioPulse BioMonitor receives FDA 510(k) clearance (K240981) for continuous hospital remote cardiac telemetry tracking. "
                "Caution: Device is intended for remote monitoring under clinical physician supervision."
            ),
            "decision": "approved",
            "rationale": "FDA 510(k) clearance number K240981 verified. Statutory clinical supervision disclaimer present.",
            "reviewer": settings.DEFAULT_USER_REVIEWER,
        },
        # 20. VerdePack Circular Polymers Packaging Case Study (Approved)
        {
            "id": "sub-retail-approved",
            "product_id": "prod-retail-green",
            "title": "VerdePack Certified 34% Decarbonized Packaging Case Study",
            "channel": "website",
            "created_by": settings.DEFAULT_USER_CREATOR,
            "status": "approved",
            "created_offset": timedelta(days=2, hours=18),
            "updated_offset": timedelta(hours=20),
            "text": (
                "VerdePack Circular Polymers reduce lifecycle carbon emissions by 34% compared to virgin petrochemical resin. "
                "Verified according to ISO 14044 third-party life cycle assessment report LCA-SGS-2026-88."
            ),
            "decision": "approved",
            "rationale": "FTC Green Guides compliant. References third-party ISO 14044 certified LCA report.",
            "reviewer": settings.DEFAULT_USER_REVIEWER,
        },
    ]

    for sub_item in demo_submissions:
        sub_obj = Submission(
            id=sub_item["id"],
            workspace_id=workspace_id,
            product_id=sub_item["product_id"],
            title=sub_item["title"],
            channel=sub_item["channel"],
            created_by=sub_item["created_by"],
            status=sub_item["status"],
            created_at=now - sub_item["created_offset"],
            updated_at=now - sub_item["updated_offset"],
        )
        db.add(sub_obj)
        db.commit()

        v1_text = sub_item["text"]
        v1_hash = calculate_sha256(v1_text)
        ver_obj = ContentVersion(
            id=f"ver-{sub_item['id']}-v1",
            submission_id=sub_obj.id,
            version_number=1,
            content_text=v1_text,
            content_hash=v1_hash,
            created_by=sub_item["created_by"],
            created_at=now - sub_item["created_offset"],
        )
        db.add(ver_obj)
        db.commit()
        sub_obj.current_version_id = ver_obj.id

        # Create Review
        rev_obj = Review(
            id=f"rev-{sub_item['id']}-01",
            submission_id=sub_obj.id,
            content_version_id=ver_obj.id,
            status="completed",
            engine_version="pineco-v1.0",
            started_at=now - sub_item["created_offset"] + timedelta(seconds=2),
            completed_at=now - sub_item["created_offset"] + timedelta(seconds=5),
        )
        db.add(rev_obj)
        db.commit()

        # Add Findings if defined
        if "findings" in sub_item:
            for f_idx, f_info in enumerate(sub_item["findings"]):
                finding_obj = Finding(
                    id=f"find-{sub_item['id']}-{f_idx+1}",
                    review_id=rev_obj.id,
                    category=f_info.get("category", "terminology"),
                    severity=f_info.get("severity", "high"),
                    confidence=1.0,
                    excerpt=f_info["excerpt"],
                    start_offset=0,
                    end_offset=len(f_info["excerpt"]),
                    explanation=f_info["explanation"],
                    evidence_status="contradicted",
                    rule_id=f_info.get("rule_id"),
                    suggested_correction=f_info.get("suggested_correction"),
                    resolution_status="open",
                    source_origin="rule_engine",
                )
                db.add(finding_obj)

        # Add Decision if approved or changes requested
        if sub_item["decision"]:
            dec_obj = ReviewDecision(
                id=f"dec-{sub_item['id']}-01",
                submission_id=sub_obj.id,
                content_version_id=ver_obj.id,
                review_id=rev_obj.id,
                decision=sub_item["decision"],
                rationale=sub_item.get("rationale", "Reviewed according to brand governance guidelines."),
                reviewer_id=sub_item.get("reviewer", settings.DEFAULT_USER_REVIEWER),
                created_at=now - sub_item["updated_offset"],
            )
            db.add(dec_obj)

        # Add Audit Event
        audit_obj = AuditEvent(
            workspace_id=workspace_id,
            actor_id=sub_item["created_by"],
            entity_type="submission",
            entity_id=sub_obj.id,
            event_type="created",
            metadata_json=json.dumps({"title": sub_obj.title, "channel": sub_obj.channel, "product_id": sub_obj.product_id}),
            created_at=now - sub_item["created_offset"],
        )
        db.add(audit_obj)

    db.commit()


if __name__ == "__main__":
    Base.metadata.create_all(bind=engine)
    session = SessionLocal()
    seed_database(session)
    session.close()
    print("Pineco enterprise database seeded successfully with 16 products and extensive mock data.")
