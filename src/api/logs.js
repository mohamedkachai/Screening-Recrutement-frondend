import axiosClient from "../utils/axiosClient";

export async function listLogs() {
	try {
		return await axiosClient.get('/logs/');
	} catch (error) {
		throw error;
	}
}
