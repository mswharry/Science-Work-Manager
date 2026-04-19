import { ROLES } from "./constants";

const editableStatuses = new Set(["pending", "rejected"]);

export function canCreateProject(user) {
  return Boolean(user && user.role === ROLES.LECTURER);
}

export function canCreatePaper(user) {
  return Boolean(user && [ROLES.LECTURER, ROLES.STUDENT].includes(user.role));
}

export function canManageProject(project, user) {
  return Boolean(
    user &&
      project &&
      user.role !== ROLES.ADMIN &&
      project.leader_id === user.id &&
      editableStatuses.has(project.status),
  );
}

export function canRequestProjectCompletion(project, user) {
  return Boolean(
    user &&
      project &&
      user.role === ROLES.LECTURER &&
      project.leader_id === user.id &&
      project.status === "approved" &&
      !project.completion_requested,
  );
}

export function canManagePaperFromList(paper, user, isMineView = false) {
  return Boolean(user && paper && user.role !== ROLES.ADMIN && isMineView && editableStatuses.has(paper.status));
}

export function canManagePaperFromDetail(paper, user) {
  return Boolean(user && paper && user.role !== ROLES.ADMIN && editableStatuses.has(paper.status));
}

export function canAdminCompleteProject(project, user) {
  return Boolean(
    user &&
      project &&
      user.role === ROLES.ADMIN &&
      project.status === "approved" &&
      project.completion_requested,
  );
}
