// utils/dateFormatter.js

/**
 * 날짜 형식을 변환하는 함수
 * @param {string} dateString - 변환할 날짜 문자열
 * @returns {string} 변환된 날짜 문자열
 */
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

/**
 * Unix 타임스탬프를 날짜 형식으로 변환하는 함수
 * @param {number} unixTimestamp - 변환할 Unix 타임스탬프
 * @returns {string} 변환된 날짜 문자열
 */
export function formatUnixTimestamp(unixTimestamp) {
    if (!unixTimestamp) return '';
    const date = new Date(unixTimestamp * 1000); // 초 단위를 밀리초로 변환
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    return `${year}년 ${month}월 ${day}일 ${hours}:${minutes}`;
}

/**
 * 날짜 시간 형식을 변환하는 함수
 * @param {string} value - 변환할 날짜 시간 문자열
 * @returns {string} 변환된 날짜 시간 문자열
 */
export function formatDateTime(value) {
    if (!value) return '';
    try {
        const date = new Date(value);
        return date.toISOString().slice(0, 16);
    } catch (e) {
        return '';
    }
}