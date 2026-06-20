import axiosClient from '../utils/axiosClient';

// Candidate
export async function applyToOffer(offerId, payload) {
    return axiosClient.post(`/offer/${offerId}/apply`, payload || {});
}

export async function listMyApplications() {
    return axiosClient.get('/offer/my/applications');
}

// HR/Admin
export async function listOfferApplications(offerId) {
    return axiosClient.get(`/offer/${offerId}/applications`);
}

export async function updateApplicationStatus(id, status) {
    return axiosClient.patch(`/application/${id}/status`, { status });
}
