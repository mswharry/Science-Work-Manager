import { ROLES } from "./constants";

const editableStatuses = new Set(["pending", "rejected"]);

export function canManageProject(project, user) {
  return Boolean(
    user &&
      project &&
      user.role !== ROLES.ADMIN &&
      project.leader_id === user.id &&
      editableStatuses.has(project.status),
  );
}

export function canManagePaperFromList(paper, user, isMineView = false) {
  return Boolean(user && paper && user.role !== ROLES.ADMIN && isMineView && editableStatuses.has(paper.status));
}

export function canManagePaperFromDetail(paper, user) {
  return Boolean(user && paper && user.role !== ROLES.ADMIN && editableStatuses.has(paper.status));
}

export function canAdminCompleteProject(project, user) {
  return Boolean(user && project && user.role === ROLES.ADMIN && project.status === "approved");
}
