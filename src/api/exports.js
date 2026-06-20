import axiosClient from '../utils/axiosClient';

function triggerDownload(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
}

function filenameFromHeaders(headers, fallback) {
    const cd = headers?.['content-disposition'] || '';
    const m = /filename="?([^"]+)"?/.exec(cd);
    return m ? m[1] : fallback;
}

export async function downloadAttemptReport(attemptId) {
    const res = await axiosClient.get(`/export/attempt/${attemptId}/pdf`, {
        responseType: 'blob',
    });
    triggerDownload(res.data, filenameFromHeaders(res.headers, `attempt_${attemptId}.pdf`));
}

export async function downloadOfferRecap(offerId) {
    const res = await axiosClient.get(`/export/offer/${offerId}/recap.pdf`, {
        responseType: 'blob',
    });
    triggerDownload(res.data, filenameFromHeaders(res.headers, `recap_${offerId}.pdf`));
}
