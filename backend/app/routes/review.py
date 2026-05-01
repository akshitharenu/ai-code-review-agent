from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import CodeReview
from app.graph import review_graph
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import uuid

router = APIRouter(prefix="/review", tags=["Code Review"])

class ReviewRequest(BaseModel):
    code: str
    filename: Optional[str] = "unknown"
    language: Optional[str] = "auto"

@router.post("/submit")
def submit_review(req: ReviewRequest, db: Session = Depends(get_db)):
    """Submit code for AI review"""

    # 1. Save to DB as pending
    review = CodeReview(
        code=req.code,
        filename=req.filename,
        language=req.language,
        status="processing"
    )
    db.add(review)
    db.commit()
    db.refresh(review)

    try:
        # 2. Run LangGraph pipeline
        print(f"\n[START] Starting review for {req.filename}")
        result = review_graph.invoke({
            "code": req.code,
            "language": req.language,
            "filename": req.filename,
            "status": "started",
            "error": None
        })

        # 3. Calculate stats
        bugs = result.get("bugs", [])
        security = result.get("security_issues", [])
        critical_bugs = len([b for b in bugs if b.get("severity") == "critical"])
        critical_security = len([s for s in security if s.get("severity") in ["critical", "high"]])

        # 4. Update DB with results
        review.status = "completed"
        review.parsed_code = result.get("parsed_code")
        review.bugs = bugs
        review.security_issues = security
        review.quality_score = result.get("quality_score")
        review.quality_feedback = result.get("quality_feedback")
        review.suggestions = result.get("suggestions", [])
        review.final_report = result.get("final_report")
        review.total_bugs = len(bugs)
        review.critical_bugs = critical_bugs
        review.total_security = len(security)
        review.critical_security = critical_security
        review.completed_at = datetime.utcnow()

        db.commit()
        db.refresh(review)

        return {
            "review_id": str(review.id),
            "status": "completed",
            "quality_score": review.quality_score,
            "total_bugs": review.total_bugs,
            "critical_bugs": review.critical_bugs,
            "total_security": review.total_security,
            "final_report": review.final_report,
            "bugs": review.bugs,
            "security_issues": review.security_issues,
            "suggestions": review.suggestions
        }

    except Exception as e:
        review.status = "failed"
        review.final_report = str(e)
        db.commit()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/")
def get_all_reviews(db: Session = Depends(get_db)):
    """Get all past reviews"""
    reviews = db.query(CodeReview).order_by(CodeReview.created_at.desc()).all()
    return reviews


@router.get("/{review_id}")
def get_review(review_id: str, db: Session = Depends(get_db)):
    """Get a specific review by ID"""
    review = db.query(CodeReview).filter(
        CodeReview.id == uuid.UUID(review_id)
    ).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    return review


@router.delete("/{review_id}")
def delete_review(review_id: str, db: Session = Depends(get_db)):
    """Delete a review"""
    review = db.query(CodeReview).filter(
        CodeReview.id == uuid.UUID(review_id)
    ).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    db.delete(review)
    db.commit()
    return {"message": "Review deleted ✅"}