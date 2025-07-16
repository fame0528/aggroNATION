import { format, formatDistance, formatRelative, parseISO, isValid } from 'date-fns';

/**
 * Format a date to a human-readable string
 * @param date The date to format (Date, string, or number)
 * @param formatStr The format string (default: 'PPpp')
 * @returns Formatted date string
 */
export function formatDate(date: Date | string | number, formatStr: string = 'PPpp'): string {
  try {
    let dateObj: Date;

    if (typeof date === 'string') {
      dateObj = parseISO(date);
    } else if (typeof date === 'number') {
      dateObj = new Date(date);
    } else {
      dateObj = date;
    }

    if (!isValid(dateObj)) {
      return 'Invalid date';
    }

    return format(dateObj, formatStr);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
}

/**
 * Format a date relative to now (e.g., "2 hours ago")
 * @param date The date to format
 * @returns Relative date string
 */
export function formatRelativeDate(date: Date | string | number): string {
  try {
    let dateObj: Date;

    if (typeof date === 'string') {
      dateObj = parseISO(date);
    } else if (typeof date === 'number') {
      dateObj = new Date(date);
    } else {
      dateObj = date;
    }

    if (!isValid(dateObj)) {
      return 'Invalid date';
    }

    return formatDistance(dateObj, new Date(), { addSuffix: true });
  } catch (error) {
    console.error('Error formatting relative date:', error);
    return 'Invalid date';
  }
}

/**
 * Format a date in a contextual way (e.g., "Today at 3:30 PM")
 * @param date The date to format
 * @returns Contextual date string
 */
export function formatContextualDate(date: Date | string | number): string {
  try {
    let dateObj: Date;

    if (typeof date === 'string') {
      dateObj = parseISO(date);
    } else if (typeof date === 'number') {
      dateObj = new Date(date);
    } else {
      dateObj = date;
    }

    if (!isValid(dateObj)) {
      return 'Invalid date';
    }

    return formatRelative(dateObj, new Date());
  } catch (error) {
    console.error('Error formatting contextual date:', error);
    return 'Invalid date';
  }
}

/**
 * Format a date for display in compact form (e.g., "Jan 15, 2023")
 * @param date The date to format
 * @returns Compact date string
 */
export function formatCompactDate(date: Date | string | number): string {
  return formatDate(date, 'MMM d, yyyy');
}

/**
 * Format a date for display with time (e.g., "Jan 15, 2023 at 3:30 PM")
 * @param date The date to format
 * @returns Date with time string
 */
export function formatDateWithTime(date: Date | string | number): string {
  return formatDate(date, "MMM d, yyyy 'at' h:mm a");
}

/**
 * Format a date for display as time only (e.g., "3:30 PM")
 * @param date The date to format
 * @returns Time string
 */
export function formatTimeOnly(date: Date | string | number): string {
  return formatDate(date, 'h:mm a');
}

/**
 * Format a date for ISO string (e.g., "2023-01-15T15:30:00Z")
 * @param date The date to format
 * @returns ISO date string
 */
export function formatISODate(date: Date | string | number): string {
  try {
    let dateObj: Date;

    if (typeof date === 'string') {
      dateObj = parseISO(date);
    } else if (typeof date === 'number') {
      dateObj = new Date(date);
    } else {
      dateObj = date;
    }

    if (!isValid(dateObj)) {
      return 'Invalid date';
    }

    return dateObj.toISOString();
  } catch (error) {
    console.error('Error formatting ISO date:', error);
    return 'Invalid date';
  }
}
