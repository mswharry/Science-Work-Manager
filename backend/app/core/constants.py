from enum import Enum


class UserRole(str, Enum):
    ADMIN = "admin"
    LECTURER = "lecturer"
    STUDENT = "student"


class CategoryType(str, Enum):
    PROJECT_TYPE = "project_type"
    PAPER_TYPE = "paper_type"


class ProjectStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    COMPLETED = "completed"


class PaperStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


class ProjectTaskStatus(str, Enum):
    TODO = "todo"
    IN_REVIEW = "in_review"
    DONE = "done"
    REJECTED = "rejected"


class ProjectReportStatus(str, Enum):
    PENDING = "pending"
    SUBMITTED = "submitted"
    APPROVED = "approved"
    REJECTED = "rejected"
    OVERDUE = "overdue"


APPROVABLE_ROLES = {UserRole.STUDENT.value, UserRole.LECTURER.value}
PROJECT_STATUS_VALUES = {status.value for status in ProjectStatus}
PAPER_STATUS_VALUES = {status.value for status in PaperStatus}
PROJECT_TASK_STATUS_VALUES = {status.value for status in ProjectTaskStatus}
PROJECT_REPORT_STATUS_VALUES = {status.value for status in ProjectReportStatus}

