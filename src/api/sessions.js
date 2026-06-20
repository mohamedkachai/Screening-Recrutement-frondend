import axiosClient from '../utils/axiosClient';

export async function getSessionByOffer(offerId) {
    return axiosClient.get(`/session/offer/${offerId}`);
}

export async function upsertSession(offerId, payload) {
    return axiosClient.post(`/session/offer/${offerId}`, payload);
}

export async function updateSession(sessionId, payload) {
    return axiosClient.put(`/session/${sessionId}`, payload);
}

export async function deleteSession(sessionId) {
    return axiosClient.delete(`/session/${sessionId}`);
}
