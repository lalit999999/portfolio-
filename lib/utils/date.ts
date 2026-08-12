import { format } from "date-fns";

const MONTH_ALIASES: Record<string, number> = {
  jan: 0,
  january: 0,
  feb: 1,
  february: 1,
  mar: 2,
  march: 2,
  apr: 3,
  april: 3,
  may: 4,
  jun: 5,
  june: 5,
  jul: 6,
  july: 6,
  aug: 7,
  august: 7,
  sep: 8,
  sept: 8,
  september: 8,
  oct: 9,
  october: 9,
  nov: 10,
  november: 10,
  dec: 11,
  december: 11,
};

const ISO_DATE = /^(\d{4})-(\d{1,2})(?:-(\d{1,2}))?$/;
const SLASH_DATE = /^(\d{1,2})\/(\d{4})$/;
const MONTH_NAME_YEAR = /^([a-zA-Z]+)\.?\s+(\d{4})$/;

function pinToFirstOfMonth(year: number, monthIndex: number): Date | null {
  if (monthIndex < 0 || monthIndex > 11) return null;
  const date = new Date(Date.UTC(year, monthIndex, 1, 12, 0, 0));
  return Number.isNaN(date.getTime()) ? null : date;
}

export function parseLooseDate(input: string): Date | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const isoMatch = trimmed.match(ISO_DATE);
  if (isoMatch) {
    const year = Number(isoMatch[1]);
    const month = Number(isoMatch[2]);
    return pinToFirstOfMonth(year, month - 1);
  }

  const slashMatch = trimmed.match(SLASH_DATE);
  if (slashMatch) {
    const month = Number(slashMatch[1]);
    const year = Number(slashMatch[2]);
    return pinToFirstOfMonth(year, month - 1);
  }

  const nameMatch = trimmed.match(MONTH_NAME_YEAR);
  if (nameMatch) {
    const monthIndex = MONTH_ALIASES[nameMatch[1].toLowerCase()];
    const year = Number(nameMatch[2]);
    if (monthIndex === undefined) return null;
    return pinToFirstOfMonth(year, monthIndex);
  }

  return null;
}

export function formatMonthYear(d: Date): string {
  return format(d, "MMMM yyyy");
}
