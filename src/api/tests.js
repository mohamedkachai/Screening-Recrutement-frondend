import axiosClient from '../utils/axiosClient';

export async function listAllTests() {
    return axiosClient.get('/test');
}

export async function listTests(offerId) {
    return axiosClient.get(`/test/offer/${offerId}`);
}

export async function createTest(payload) {
    return axiosClient.post('/test', payload);
}

export async function reorderOfferTests(offerId, orderedIds) {
    return axiosClient.put(`/test/offer/${offerId}/reorder`, { orderedIds });
}

export async function getTest(testId) {
    return axiosClient.get(`/test/${testId}`);
}

export async function updateTest(testId, payload) {
    return axiosClient.put(`/test/${testId}`, payload);
}

export async function deleteTest(testId) {
    return axiosClient.delete(`/test/${testId}`);
}

export async function assignTest(testId, offerId) {
    return axiosClient.post(`/test/${testId}/assign`, { offerId });
}

export async function unassignTest(testId, offerId) {
    return axiosClient.delete(`/test/${testId}/assign/${offerId}`);
}

export async function createQuestion(testId, payload) {
    return axiosClient.post(`/test/${testId}/question`, payload);
}

export async function updateQuestion(testId, questionId, payload) {
    return axiosClient.put(`/test/${testId}/question/${questionId}`, payload);
}

export async function deleteQuestion(testId, questionId) {
    return axiosClient.delete(`/test/${testId}/question/${questionId}`);
}

export async function reorderQuestions(testId, orderedIds) {
    return axiosClient.put(`/test/${testId}/question/reorder`, { orderedIds });
}

export async function generateAiQuestions(testId, payload) {
    return axiosClient.post(`/test/${testId}/generate-ai`, payload);
}
