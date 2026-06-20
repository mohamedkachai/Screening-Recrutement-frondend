import axiosClient from '../utils/axiosClient';

// Candidate
export async function getMyAttempt(offerId) {
    return axiosClient.get(`/attempt/offer/${offerId}/me`);
}

export async function startAttempt(offerId) {
    return axiosClient.post(`/attempt/offer/${offerId}/start`);
}

export async function saveAnswer(attemptId, questionId, value) {
    return axiosClient.post(`/attempt/${attemptId}/answer`, { questionId, value });
}

export async function recordEvent(attemptId, type) {
    return axiosClient.post(`/attempt/${attemptId}/event`, { type });
}

export async function submitAttempt(attemptId) {
    return axiosClient.post(`/attempt/${attemptId}/submit`);
}

// HR / Reviewer
export async function listAllAttempts(params) {
    return axiosClient.get('/attempt', { params });
}

export async function listAttemptsByOffer(offerId) {
    return axiosClient.get(`/attempt/offer/${offerId}`);
}

export async function getAttemptDetail(attemptId) {
    return axiosClient.get(`/attempt/${attemptId}`);
}

export async function gradeAttempt(attemptId, grades) {
    return axiosClient.post(`/attempt/${attemptId}/grade`, { grades });
}
