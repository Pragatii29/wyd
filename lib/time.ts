const HOUR = 60 * 60 * 1000;

export function isoHoursAgo(hours: number) {
  return new Date(Date.now() - hours * HOUR).toISOString();
}

export function olderThanHours(iso: string, hours: number) {
  return Date.now() - new Date(iso).getTime() > hours * HOUR;
}

export function ageOn(dob: string, now = new Date()) {
  const d = new Date(dob);
  let age = now.getFullYear() - d.getFullYear();
  if (now.getMonth() < d.getMonth() || (now.getMonth() === d.getMonth() && now.getDate() < d.getDate())) age--;
  return age;
}
