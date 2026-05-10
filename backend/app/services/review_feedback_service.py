from __future__ import annotations

from datetime import date, datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy import Select, func, select
from sqlalchemy.orm import Session, joinedload

from app.core.constants import ReviewAssignmentStatus, ReviewRoundStatus
from app.models.review_assignment import ReviewAssignment
from app.models.review_feedback import ReviewFeedback
from app.models.review_round import ReviewRound
from app.services.approval_history_service import add_history_entry
from app.services.review_round_service import update_round_status


FEEDBACK_NOT_FOUND = "Không tìm thấy phiếu nhận xét."
ASSIGNMENT_NOT_FOUND = "Không tìm thấy phân công phản biện."

FEEDBACK_FORBIDDEN = "Không có quyền phản biện đề tài này."
FEEDBACK_OVERDUE = "Đã quá hạn nộp phiếu phản biện."
FEEDBACK_COMMENT_REQUIRED = "Vui lòng nhập nội dung nhận xét."
FEEDBACK_SCORE_REQUIRED = "Vui lòng nhập điểm đánh giá."
FEEDBACK_SCORE_RANGE = "Điểm đánh giá phải nằm trong khoảng 0 đến 10."
FEEDBACK_SUMMARY_EMPTY = "Chưa có phiếu nhận xét để tổng hợp."


def get_feedback_by_assignment(db: Session, assignment_id: int) -> ReviewFeedback | None:
    stmt: Select[tuple[ReviewFeedback]] = (
        select(ReviewFeedback)
        .where(ReviewFeedback.assignment_id == assignment_id)
        .options(joinedload(ReviewFeedback.reviewer))
    )
    return db.scalar(stmt)


def list_feedbacks_by_project(db: Session, project_id: int) -> list[ReviewFeedback]:
    stmt: Select[tuple[ReviewFeedback]] = (
        select(ReviewFeedback)
        .join(ReviewAssignment, ReviewAssignment.id == ReviewFeedback.assignment_id)
        .where(ReviewAssignment.project_id == project_id)
        .options(joinedload(ReviewFeedback.reviewer))
        .order_by(ReviewFeedback.created_at.desc())
    )
    return list(db.scalars(stmt))


def _classify_recommendation(value: str | None) -> str:
    if not value:
        return "other"

    normalized = value.strip().lower()
    if "không" in normalized or "khong" in normalized or "reject" in normalized or "không duyệt" in normalized:
        return "reject"
    if "duyệt" in normalized or "duyet" in normalized or "approve" in normalized:
        return "approve"
    return "other"


def save_feedback_summary(db: Session, project_id: int, admin_user_id: int) -> None:
    feedbacks = [
        feedback
        for feedback in list_feedbacks_by_project(db=db, project_id=project_id)
        if feedback.submitted_at is not None
    ]
    if not feedbacks:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=FEEDBACK_SUMMARY_EMPTY)

    scores = [float(feedback.score) for feedback in feedbacks if feedback.score is not None]
    recommendations = [_classify_recommendation(feedback.recommendation) for feedback in feedbacks]
    approve_count = recommendations.count("approve")
    reject_count = recommendations.count("reject")
    other_count = recommendations.count("other")

    score_detail = "chưa có điểm"
    if scores:
        average_score = sum(scores) / len(scores)
        score_detail = f"điểm TB {average_score:.2f}, min {min(scores):.2f}, max {max(scores):.2f}"

    round_item = db.scalar(
        select(ReviewRound).where(ReviewRound.project_id == project_id).order_by(ReviewRound.round_number.desc())
    )
    add_history_entry(
        db=db,
        project_id=project_id,
        round_id=round_item.id if round_item else None,
        action="feedback_summary_saved",
        previous_status=round_item.status.value if round_item else None,
        new_status=round_item.status.value if round_item else None,
        detail=(
            f"Đã lưu tổng hợp phản biện: {len(feedbacks)} phiếu, {score_detail}, "
            f"đề xuất duyệt {approve_count}, không duyệt {reject_count}, khác {other_count}."
        ),
        performed_by=admin_user_id,
    )
    db.commit()


def submit_review_feedback(
    db: Session,
    assignment_id: int,
    reviewer_id: int,
    score: float | None,
    comment: str | None,
    strengths: str | None,
    weaknesses: str | None,
    recommendation: str | None,
    attachment_url: str | None,
    submit: bool = True,
) -> ReviewFeedback:
    assignment = db.get(ReviewAssignment, assignment_id)
    if not assignment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=ASSIGNMENT_NOT_FOUND)

    if assignment.reviewer_id != reviewer_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=FEEDBACK_FORBIDDEN)

    if submit:
        if assignment.due_date and assignment.due_date < date.today():
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=FEEDBACK_OVERDUE)
        if score is None:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=FEEDBACK_SCORE_REQUIRED)
        if score < 0 or score > 10:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=FEEDBACK_SCORE_RANGE)
        if not comment or not comment.strip():
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=FEEDBACK_COMMENT_REQUIRED)
    feedback = get_feedback_by_assignment(db=db, assignment_id=assignment_id)
    if not feedback:
        feedback = ReviewFeedback(assignment_id=assignment_id, reviewer_id=reviewer_id)
        db.add(feedback)

    feedback.score = score
    feedback.comment = comment
    feedback.strengths = strengths
    feedback.weaknesses = weaknesses
    feedback.recommendation = recommendation
    feedback.attachment_url = attachment_url
    feedback.submitted_at = datetime.now(timezone.utc) if submit else None

    if submit:
        assignment.status = ReviewAssignmentStatus.SUBMITTED
        assignment.submitted_at = datetime.now(timezone.utc)

    db.flush()

    if submit:
        round_item = db.get(ReviewRound, assignment.round_id)
        if round_item:
            total_assignments = db.scalar(
                select(func.count(ReviewAssignment.id)).where(ReviewAssignment.round_id == round_item.id)
            ) or 0
            submitted_assignments = db.scalar(
                select(func.count(ReviewAssignment.id)).where(
                    ReviewAssignment.round_id == round_item.id,
                    ReviewAssignment.status == ReviewAssignmentStatus.SUBMITTED,
                )
            ) or 0
            if total_assignments > 0 and submitted_assignments == total_assignments:
                update_round_status(
                    db=db,
                    round_item=round_item,
                    new_status=ReviewRoundStatus.DECISION_PENDING,
                    action="review_completed",
                    detail="Đã nhận đủ phiếu phản biện.",
                    performed_by=reviewer_id,
                )

    db.commit()
    return feedback
