// utils/dateFormatter.js

export function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    return `${year}년 ${month}월 ${day}일 ${hours}:${minutes}`;
}

export function formatDateTime(value) {
    if (!value) return '';
    try {
        const date = new Date(value);
        return date.toISOString().slice(0, 16);
    } catch (e) {
        return '';
    }
}