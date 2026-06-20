import axiosClient from "../utils/axiosClient";

export async function signUp(values) {
	try {
		return await axiosClient.post('/auth/signup', values);
	} catch (error) {
		throw error;
	}
}

export async function loginUser(values) {
	try {
		return await axiosClient.post('/auth/login', values);
	} catch (error) {
		throw error;
	}
}

export async function changePassword(values) {
	try {
		return await axiosClient.put('/auth/change-password', values);
	} catch (error) {
		throw error;
	}
}

export async function getCurrentUser() {
	try {
		return await axiosClient.get('/auth/me');
	} catch (error) {
		throw error;
	}
}

export async function forgotPassword(email) {
    try {
        return await axiosClient.post('/auth/forgot-password', { email: email });
    } catch (error) {
        throw error;
    }
}

export async function resetPassword(token, values) {
    try {
        return await axiosClient.put(`/auth/reset-password/${token}`, values);
    } catch (error) {
        throw error;
    }
}