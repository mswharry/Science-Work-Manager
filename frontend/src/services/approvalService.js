import api from "./api";

export async function listApprovalProjects(filters = {}) {
  const params = {};
  if (filters.status) {
    params.status = filters.status;
  }
  if (filters.department) {
    params.department = filters.department;
  }
  if (filters.keyword) {
    params.keyword = filters.keyword;
  }
  if (filters.start_date) {
    params.start_date = filters.start_date;
  }
  if (filters.end_date) {
    params.end_date = filters.end_date;
  }
  const response = await api.get("/approval/projects", { params });
  return response.data;
}

export async function getApprovalProject(projectId) {
  const response = await api.get(`/approval/projects/${projectId}`);
  return response.data;
}

export async function getApprovalRound(projectId) {
  const response = await api.get(`/approval/projects/${projectId}/round`);
  return response.data;
}

export async function recordFormCheck(projectId, payload) {
  const response = await api.post(`/approval/projects/${projectId}/form-check`, payload);
  return response.data;
}

export async function scheduleCouncilMeeting(projectId, payload) {
  const response = await api.post(`/approval/projects/${projectId}/meeting`, payload);
  return response.data;
}

export async function listReviewerCandidates(projectId, filters = {}) {
  const params = { project_id: projectId };
  if (filters.keyword) {
    params.keyword = filters.keyword;
  }
  if (filters.department) {
    params.department = filters.department;
  }
  const response = await api.get("/approval/reviewers/candidates", { params });
  return response.data;
}

export async function listProjectAssignments(projectId) {
  const response = await api.get(`/approval/projects/${projectId}/assignments`);
  return response.data;
}

export async function assignReviewers(projectId, payload) {
  const response = await api.post(`/approval/projects/${projectId}/assignments`, payload);
  return response.data;
}

export async function listProjectFeedbacks(projectId) {
  const response = await api.get(`/approval/projects/${projectId}/feedbacks`);
  return response.data;
}

export async function saveFeedbackSummary(projectId) {
  const response = await api.post(`/approval/projects/${projectId}/feedback-summary`);
  return response.data;
}

export async function listReviewerAssignments(filters = {}) {
  const params = {};
  if (filters.status) {
    params.status = filters.status;
  }
  const response = await api.get("/approval/reviewer/assignments", { params });
  return response.data;
}

export async function getAssignmentFeedback(assignmentId) {
  const response = await api.get(`/approval/assignments/${assignmentId}/feedback`);
  return response.data;
}

export async function submitAssignmentFeedback(assignmentId, payload) {
  const response = await api.post(`/approval/assignments/${assignmentId}/feedback`, payload);
  return response.data;
}

export async function makeApprovalDecision(projectId, payload) {
  const response = await api.post(`/approval/projects/${projectId}/decision`, payload);
  return response.data;
}

export async function listApprovalDecisions(projectId) {
  const response = await api.get(`/approval/projects/${projectId}/decisions`);
  return response.data;
}

export async function requestRevision(roundId, payload) {
  const response = await api.post(`/approval/rounds/${roundId}/revision-request`, payload);
  return response.data;
}

export async function getReviewRound(roundId) {
  const response = await api.get(`/approval/rounds/${roundId}`);
  return response.data;
}

export async function submitRevision(roundId, payload) {
  const response = await api.post(`/approval/rounds/${roundId}/revision-submit`, payload);
  return response.data;
}

export async function extendRoundDeadline(roundId, payload) {
  const response = await api.post(`/approval/rounds/${roundId}/extend-deadline`, payload);
  return response.data;
}

export async function cancelReviewRound(roundId, payload) {
  const response = await api.post(`/approval/rounds/${roundId}/cancel`, payload);
  return response.data;
}

export async function listApprovalHistory(projectId) {
  const response = await api.get(`/approval/projects/${projectId}/history`);
  return response.data;
}
