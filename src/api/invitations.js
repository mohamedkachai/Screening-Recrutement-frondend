import axiosClient from '../utils/axiosClient';

// HR/Admin
export async function createInvitation(payload) {
    return axiosClient.post('/invitations', payload);
}

export async function createBatchInvitations(payload) {
    return axiosClient.post('/invitations/batch', payload);
}

export async function listInvitations(params) {
    return axiosClient.get('/invitations', { params });
}

export async function revokeInvitation(id) {
    return axiosClient.delete('/invitations/' + id);
}

// Public — token-based
export async function getInvitationByToken(token) {
    return axiosClient.get('/invitations/' + token);
}

export async function acceptInvitation(token, payload) {
    return axiosClient.post(`/invitations/${token}/accept`, payload);
}
