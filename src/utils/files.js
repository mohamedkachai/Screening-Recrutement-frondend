const FILES_URL = import.meta.env.VITE_FILES_URL || 'http://localhost:3000/uploads';

export function fileUrl(filename) {
    if (!filename) {
        return undefined;
    }
    return `${FILES_URL}/${filename}`;
}
