from enum import Enum


class UserRole(str, Enum):
    ADMIN = "admin"
    LECTURER = "lecturer"
    STUDENT = "student"


class CategoryType(str, Enum):
    PROJECT_TYPE = "project_type"
    PAPER_TYPE = "paper_type"


class ProjectStatus(str, Enum):
    DRAFT = "draft"
    SUBMITTED = "submitted"
    CANCELED = "canceled"
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    COMPLETED = "completed"


class PaperStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


class ReviewAssignmentStatus(str, Enum):
    ASSIGNED = "assigned"
    SUBMITTED = "submitted"
    OVERDUE = "overdue"


class ReviewRoundStatus(str, Enum):
    FORM_CHECK_PENDING = "form_check_pending"
    FORM_CHECK_FAILED = "form_check_failed"
    ASSIGNMENT_PENDING = "assignment_pending"
    IN_REVIEW = "in_review"
    COUNCIL_SCHEDULED = "council_scheduled"
    DECISION_PENDING = "decision_pending"
    REVISION_REQUESTED = "revision_requested"
    REVISION_SUBMITTED = "revision_submitted"
    DECIDED = "decided"
    CANCELED = "canceled"


class ApprovalDecisionType(str, Enum):
    APPROVED = "approved"
    REJECTED = "rejected"
    REVISION_REQUIRED = "revision_required"


class AcademicPlanStatus(str, Enum):
    DRAFT = "draft"
    ACTIVE = "active"
    CLOSED = "closed"


class EntityType(str, Enum):
    PROJECT = "project"
    PAPER = "paper"


APPROVABLE_ROLES = {UserRole.STUDENT.value, UserRole.LECTURER.value}
PROJECT_STATUS_VALUES = {status.value for status in ProjectStatus}
PAPER_STATUS_VALUES = {status.value for status in PaperStatus}
ACADEMIC_PLAN_STATUS_VALUES = {status.value for status in AcademicPlanStatus}
REVIEW_ASSIGNMENT_STATUS_VALUES = {status.value for status in ReviewAssignmentStatus}
REVIEW_ROUND_STATUS_VALUES = {status.value for status in ReviewRoundStatus}
APPROVAL_DECISION_TYPES = {status.value for status in ApprovalDecisionType}
