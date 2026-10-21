const HOUR = 60 * 60 * 1000;

export function isoHoursAgo(hours: number) {
  return new Date(Date.now() - hours * HOUR).toISOString();
}

export function olderThanHours(iso: string, hours: number) {
  return Date.now() - new Date(iso).getTime() > hours * HOUR;
}
