from __future__ import annotations

from datetime import date
from typing import Annotated

from fastapi import APIRouter, Depends, Query, status, HTTPException

from app.api.deps import DbSession, get_current_admin_user, get_current_user
from app.models.user import User
from app.schemas.approval_decision import ApprovalDecisionCreate, ApprovalDecisionOut
from app.schemas.approval_history import ApprovalHistoryOut
from app.schemas.common import MessageResponse
from app.schemas.project import ProjectOut
from app.schemas.review_assignment import ReviewAssignmentCreate, ReviewAssignmentOut, ReviewerCandidateOut
from app.schemas.review_feedback import ReviewFeedbackCreate, ReviewFeedbackOut
from app.schemas.review_round import (
    FormCheckRequest,
    MeetingScheduleRequest,
    ReviewRoundOut,
    RevisionRequest,
    RevisionSubmissionRequest,
    RoundCancelRequest,
    RoundDeadlineExtensionRequest,
)
from app.services.approval_decision_service import list_decisions_by_project, make_approval_decision
from app.services.approval_history_service import list_approval_history
from app.services.project_approval_service import get_project_for_approval, list_projects_for_approval
from app.services.project_service import get_project_detail
from app.services.review_assignment_service import assign_reviewers, get_assignment_by_id, list_assignments_by_project, list_assignments_for_reviewer, list_reviewer_candidates
from app.services.review_feedback_service import get_feedback_by_assignment, list_feedbacks_by_project, save_feedback_summary, submit_review_feedback
from app.services.review_round_service import (
    cancel_review_round,
    create_revision_request,
    extend_round_deadline,
    get_current_round,
    get_round_by_id,
    record_form_check,
    schedule_council_meeting,
    submit_revision,
)

router = APIRouter(tags=["approvals"])


@router.get("/approval/projects", response_model=list[ProjectOut])
def list_projects_for_approval_endpoint(
    db: DbSession,
    _: Annotated[User, Depends(get_current_admin_user)],
    status_filter: str | None = Query(default=None, alias="status"),
    department: str | None = Query(default=None),
    keyword: str | None = Query(default=None),
    start_date: date | None = Query(default=None),
    end_date: date | None = Query(default=None),
) -> list[ProjectOut]:
    projects = list_projects_for_approval(
        db=db,
        status_filter=status_filter,
        department=department,
        keyword=keyword,
        start_date=start_date,
        end_date=end_date,
    )
    return [ProjectOut.model_validate(project) for project in projects]


@router.get("/approval/projects/{project_id}", response_model=ProjectOut)
def get_project_for_approval_endpoint(
    project_id: int,
    db: DbSession,
    _: Annotated[User, Depends(get_current_admin_user)],
) -> ProjectOut:
    project = get_project_for_approval(db=db, project_id=project_id)
    return ProjectOut.model_validate(project)


@router.get("/approval/projects/{project_id}/round", response_model=ReviewRoundOut)
def get_project_round_endpoint(
    project_id: int,
    db: DbSession,
    _: Annotated[User, Depends(get_current_admin_user)],
) -> ReviewRoundOut:
    round_item = get_current_round(db=db, project_id=project_id)
    return ReviewRoundOut.model_validate(round_item)


@router.post("/approval/projects/{project_id}/form-check", response_model=ReviewRoundOut)
def record_form_check_endpoint(
    project_id: int,
    payload: FormCheckRequest,
    db: DbSession,
    admin_user: Annotated[User, Depends(get_current_admin_user)],
) -> ReviewRoundOut:
    round_item = get_current_round(db=db, project_id=project_id)
    round_item = record_form_check(db=db, round_id=round_item.id, passed=payload.passed, note=payload.note, admin_user_id=admin_user.id)
    return ReviewRoundOut.model_validate(round_item)


@router.post("/approval/projects/{project_id}/meeting", response_model=ReviewRoundOut)
def schedule_meeting_endpoint(
    project_id: int,
    payload: MeetingScheduleRequest,
    db: DbSession,
    admin_user: Annotated[User, Depends(get_current_admin_user)],
) -> ReviewRoundOut:
    round_item = get_current_round(db=db, project_id=project_id)
    round_item = schedule_council_meeting(
        db=db,
        round_id=round_item.id,
        meeting_at=payload.meeting_at,
        meeting_location=payload.meeting_location,
        admin_user_id=admin_user.id,
    )
    return ReviewRoundOut.model_validate(round_item)


@router.get("/approval/rounds/{round_id}", response_model=ReviewRoundOut)
def get_round_by_id_endpoint(
    round_id: int,
    db: DbSession,
    _: Annotated[User, Depends(get_current_user)],
) -> ReviewRoundOut:
    round_item = get_round_by_id(db=db, round_id=round_id)
    return ReviewRoundOut.model_validate(round_item)


@router.get("/approval/reviewers/candidates", response_model=list[ReviewerCandidateOut])
def list_reviewer_candidates_endpoint(
    project_id: int,
    db: DbSession,
    _: Annotated[User, Depends(get_current_admin_user)],
    keyword: str | None = Query(default=None),
    department: str | None = Query(default=None),
) -> list[ReviewerCandidateOut]:
    reviewers = list_reviewer_candidates(db=db, project_id=project_id, keyword=keyword, department=department)
    return [ReviewerCandidateOut.model_validate(reviewer) for reviewer in reviewers]


@router.get("/approval/projects/{project_id}/assignments", response_model=list[ReviewAssignmentOut])
def list_assignments_by_project_endpoint(
    project_id: int,
    db: DbSession,
    _: Annotated[User, Depends(get_current_admin_user)],
) -> list[ReviewAssignmentOut]:
    assignments = list_assignments_by_project(db=db, project_id=project_id)
    results = []
    for assignment in assignments:
        assignment.project_name = assignment.project.name if assignment.project else None
        assignment.project_code = assignment.project.code if assignment.project else None
        assignment.reviewer_name = assignment.reviewer.full_name if assignment.reviewer else None
        assignment.reviewer_email = assignment.reviewer.email if assignment.reviewer else None
        assignment.reviewer_department = assignment.reviewer.department if assignment.reviewer else None
        assignment.assigned_by_name = assignment.assigner.full_name if assignment.assigner else None
        results.append(ReviewAssignmentOut.model_validate(assignment))
    return results


@router.post("/approval/projects/{project_id}/assignments", response_model=list[ReviewAssignmentOut])
def assign_reviewers_endpoint(
    project_id: int,
    payload: list[ReviewAssignmentCreate],
    db: DbSession,
    admin_user: Annotated[User, Depends(get_current_admin_user)],
) -> list[ReviewAssignmentOut]:
    reviewer_ids = [item.reviewer_id for item in payload]
    due_date = payload[0].due_date if payload else None
    note = payload[0].note if payload else None
    assignments = assign_reviewers(
        db=db,
        project_id=project_id,
        reviewer_ids=reviewer_ids,
        due_date=due_date,
        note=note,
        admin_user_id=admin_user.id,
    )
    results = []
    for assignment in assignments:
        assignment.reviewer_name = assignment.reviewer.full_name if assignment.reviewer else None
        assignment.reviewer_email = assignment.reviewer.email if assignment.reviewer else None
        assignment.reviewer_department = assignment.reviewer.department if assignment.reviewer else None
        assignment.assigned_by_name = assignment.assigner.full_name if assignment.assigner else None
        results.append(ReviewAssignmentOut.model_validate(assignment))
    return results


@router.get("/approval/projects/{project_id}/feedbacks", response_model=list[ReviewFeedbackOut])
def list_feedbacks_by_project_endpoint(
    project_id: int,
    db: DbSession,
    _: Annotated[User, Depends(get_current_admin_user)],
) -> list[ReviewFeedbackOut]:
    feedbacks = list_feedbacks_by_project(db=db, project_id=project_id)
    results = []
    for feedback in feedbacks:
        feedback.reviewer_name = feedback.reviewer.full_name if feedback.reviewer else None
        results.append(ReviewFeedbackOut.model_validate(feedback))
    return results


@router.post("/approval/projects/{project_id}/feedback-summary", response_model=MessageResponse)
def save_feedback_summary_endpoint(
    project_id: int,
    db: DbSession,
    admin_user: Annotated[User, Depends(get_current_admin_user)],
) -> MessageResponse:
    save_feedback_summary(db=db, project_id=project_id, admin_user_id=admin_user.id)
    return MessageResponse(message="Đã lưu kết quả tổng hợp phản biện.")


@router.get("/approval/reviewer/assignments", response_model=list[ReviewAssignmentOut])
def list_assignments_for_reviewer_endpoint(
    db: DbSession,
    current_user: Annotated[User, Depends(get_current_user)],
    status_filter: str | None = Query(default=None, alias="status"),
) -> list[ReviewAssignmentOut]:
    assignments = list_assignments_for_reviewer(db=db, reviewer_id=current_user.id, status=status_filter)
    results = []
    for assignment in assignments:
        assignment.project_name = assignment.project.name if assignment.project else None
        assignment.project_code = assignment.project.code if assignment.project else None
        assignment.reviewer_name = assignment.reviewer.full_name if assignment.reviewer else None
        assignment.reviewer_email = assignment.reviewer.email if assignment.reviewer else None
        assignment.reviewer_department = assignment.reviewer.department if assignment.reviewer else None
        assignment.assigned_by_name = assignment.assigner.full_name if assignment.assigner else None
        results.append(ReviewAssignmentOut.model_validate(assignment))
    return results


@router.get("/approval/assignments/{assignment_id}/feedback", response_model=ReviewFeedbackOut)
def get_feedback_by_assignment_endpoint(
    assignment_id: int,
    db: DbSession,
    current_user: Annotated[User, Depends(get_current_user)],
) -> ReviewFeedbackOut:
    feedback = get_feedback_by_assignment(db=db, assignment_id=assignment_id)
    if not feedback:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy phiếu nhận xét.")
    if feedback.reviewer_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Bạn không có quyền xem phiếu nhận xét này.")
    feedback.reviewer_name = feedback.reviewer.full_name if feedback.reviewer else None
    return ReviewFeedbackOut.model_validate(feedback)


@router.get("/approval/assignments/{assignment_id}", response_model=ReviewAssignmentOut)
def get_assignment_endpoint(
    assignment_id: int,
    db: DbSession,
    current_user: Annotated[User, Depends(get_current_user)],
) -> ReviewAssignmentOut:
    assignment = get_assignment_by_id(db=db, assignment_id=assignment_id)
    if not assignment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy phân công phản biện.")
    if assignment.reviewer_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Bạn không có quyền xem phân công này.")
    assignment.project_name = assignment.project.name if assignment.project else None
    assignment.project_code = assignment.project.code if assignment.project else None
    assignment.reviewer_name = assignment.reviewer.full_name if assignment.reviewer else None
    assignment.reviewer_email = assignment.reviewer.email if assignment.reviewer else None
    assignment.reviewer_department = assignment.reviewer.department if assignment.reviewer else None
    return ReviewAssignmentOut.model_validate(assignment)


@router.post("/approval/assignments/{assignment_id}/feedback", response_model=ReviewFeedbackOut)
def submit_feedback_endpoint(
    assignment_id: int,
    payload: ReviewFeedbackCreate,
    db: DbSession,
    current_user: Annotated[User, Depends(get_current_user)],
) -> ReviewFeedbackOut:
    feedback = submit_review_feedback(
        db=db,
        assignment_id=assignment_id,
        reviewer_id=current_user.id,
        score=payload.score,
        comment=payload.comment,
        strengths=payload.strengths,
        weaknesses=payload.weaknesses,
        recommendation=payload.recommendation,
        attachment_url=payload.attachment_url,
        submit=payload.submit,
    )
    feedback.reviewer_name = feedback.reviewer.full_name if feedback.reviewer else None
    return ReviewFeedbackOut.model_validate(feedback)


@router.post("/approval/projects/{project_id}/decision", response_model=ApprovalDecisionOut)
def make_approval_decision_endpoint(
    project_id: int,
    payload: ApprovalDecisionCreate,
    db: DbSession,
    admin_user: Annotated[User, Depends(get_current_admin_user)],
) -> ApprovalDecisionOut:
    decision = make_approval_decision(
        db=db,
        project_id=project_id,
        decision_type=payload.decision_type,
        approved_budget=payload.approved_budget,
        start_date=payload.start_date,
        end_date=payload.end_date,
        conditions=payload.conditions,
        note=payload.note,
        attachment_url=payload.attachment_url,
        admin_user_id=admin_user.id,
    )
    decision.decided_by_name = decision.decider.full_name if decision.decider else None
    return ApprovalDecisionOut.model_validate(decision)


@router.get("/approval/projects/{project_id}/decisions", response_model=list[ApprovalDecisionOut])
def list_decisions_endpoint(
    project_id: int,
    db: DbSession,
    current_user: Annotated[User, Depends(get_current_user)],
) -> list[ApprovalDecisionOut]:
    _ = get_project_detail(db=db, project_id=project_id, current_user=current_user)
    decisions = list_decisions_by_project(db=db, project_id=project_id)
    results = []
    for decision in decisions:
        decision.decided_by_name = decision.decider.full_name if decision.decider else None
        results.append(ApprovalDecisionOut.model_validate(decision))
    return results


@router.post("/approval/rounds/{round_id}/revision-request", response_model=ReviewRoundOut)
def create_revision_request_endpoint(
    round_id: int,
    payload: RevisionRequest,
    db: DbSession,
    admin_user: Annotated[User, Depends(get_current_admin_user)],
) -> ReviewRoundOut:
    round_item = create_revision_request(
        db=db,
        round_id=round_id,
        content=payload.content,
        deadline=payload.deadline,
        required_files=payload.required_files,
        admin_user_id=admin_user.id,
    )
    return ReviewRoundOut.model_validate(round_item)


@router.post("/approval/rounds/{round_id}/revision-submit", response_model=ReviewRoundOut)
def submit_revision_endpoint(
    round_id: int,
    payload: RevisionSubmissionRequest,
    db: DbSession,
    current_user: Annotated[User, Depends(get_current_user)],
) -> ReviewRoundOut:
    round_item = submit_revision(
        db=db,
        round_id=round_id,
        revision_files=payload.revision_files,
        note=payload.note,
        submitter_id=current_user.id,
    )
    return ReviewRoundOut.model_validate(round_item)


@router.post("/approval/rounds/{round_id}/extend-deadline", response_model=ReviewRoundOut)
def extend_round_deadline_endpoint(
    round_id: int,
    payload: RoundDeadlineExtensionRequest,
    db: DbSession,
    admin_user: Annotated[User, Depends(get_current_admin_user)],
) -> ReviewRoundOut:
    round_item = extend_round_deadline(
        db=db,
        round_id=round_id,
        revision_deadline=payload.revision_deadline,
        reason=payload.reason,
        admin_user_id=admin_user.id,
    )
    return ReviewRoundOut.model_validate(round_item)


@router.post("/approval/rounds/{round_id}/cancel", response_model=ReviewRoundOut)
def cancel_review_round_endpoint(
    round_id: int,
    payload: RoundCancelRequest,
    db: DbSession,
    admin_user: Annotated[User, Depends(get_current_admin_user)],
) -> ReviewRoundOut:
    round_item = cancel_review_round(
        db=db,
        round_id=round_id,
        reason=payload.reason,
        admin_user_id=admin_user.id,
    )
    return ReviewRoundOut.model_validate(round_item)


@router.get("/approval/projects/{project_id}/history", response_model=list[ApprovalHistoryOut])
def list_approval_history_endpoint(
    project_id: int,
    db: DbSession,
    current_user: Annotated[User, Depends(get_current_user)],
) -> list[ApprovalHistoryOut]:
    _ = get_project_detail(db=db, project_id=project_id, current_user=current_user)
    histories = list_approval_history(db=db, project_id=project_id)
    results = []
    for history in histories:
        history.performed_by_name = history.performer.full_name if history.performer else None
        results.append(ApprovalHistoryOut.model_validate(history))
    return results
