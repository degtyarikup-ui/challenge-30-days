export function getDateInfo(customDate) {
    const now = new Date();
    const actualDate = formatDate(now);
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayDate = formatDate(yesterday);
    const hour = now.getHours();
    const isGracePeriod = hour < 12; // before 12:00 PM
    const targetDate = customDate || actualDate;
    return {
        actualDate,
        targetDate,
        yesterdayDate,
        isGracePeriod,
        gracePeriodDeadline: isGracePeriod ? `До 12:00 (${formatDateRu(actualDate)})` : 'Дедлайн закрыт',
    };
}
export function formatDate(d) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}
export function formatDateRu(dateStr) {
    const [y, m, d] = dateStr.split('-');
    return `${d}.${m}.${y}`;
}
