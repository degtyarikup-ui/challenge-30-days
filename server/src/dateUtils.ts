export interface DateInfo {
  actualDate: string; // Real calendar YYYY-MM-DD
  targetDate: string; // The primary active challenge date (or selected)
  yesterdayDate: string;
  isGracePeriod: boolean; // True if hour < 12 (00:00 - 11:59)
  gracePeriodDeadline: string; // e.g. "Сегодня до 12:00"
}

export function getDateInfo(customDate?: string): DateInfo {
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

export function formatDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDateRu(dateStr: string): string {
  const [y, m, d] = dateStr.split('-');
  return `${d}.${m}.${y}`;
}
