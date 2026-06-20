import axiosClient from '../utils/axiosClient';

// Public — does not require auth
export async function listPublicOffers() {
    return axiosClient.get('/offer/public');
}

// HR/Admin
export async function listOffers(params) {
    return axiosClient.get('/offer', { params });
}

export async function getOffer(id) {
    return axiosClient.get('/offer/' + id);
}

export async function createOffer(payload) {
    return axiosClient.post('/offer', payload);
}

export async function updateOffer(id, payload) {
    return axiosClient.put('/offer/' + id, payload);
}

export async function deleteOffer(id) {
    return axiosClient.delete('/offer/' + id);
}
