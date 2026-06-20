import { format } from "date-fns";
import axiosClient from "../utils/axiosClient";

export async function createUser(values, avatarFilename) {
    try {
        const payload = {
            ...values,
            dob: values.dob ? format(values.dob, "yyyy-MM-dd") : undefined,
            avatar: avatarFilename
        }

        const response = await axiosClient.post('/user/create', payload);

        return response;
    } catch (error) {
        throw error
    }
}

export async function listUsers() {
    try {
        return await axiosClient.get('/user');
    } catch (error) {
        throw error
    }
}

export async function getUserById(id) {
    try {
        return await axiosClient.get('/user/' + id);
    } catch (error) {
        throw error;
    }
}

export async function updateUser(id, payload) {
    try {
        return await axiosClient.put('/user/update/' + id, payload);
    } catch (error) {
        throw error;
    }
}

export async function updateMyProfile(payload) {
    try {
        return await axiosClient.put('/user/me/profile', payload);
    } catch (error) {
        throw error;
    }
}

export async function deleteUser(id) {
    try {
        return await axiosClient.delete('/user/' + id);
    } catch (error) {
        throw error;
    }
}