import { ValidationOptions, registerDecorator } from 'class-validator';

const CUIT_WEIGHTS = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];

/** Argentina has no daylight saving time, so a fixed offset is safe. */
const AR_UTC_OFFSET_HOURS = 3;

export function normalizeCuit(value: string) {
  return value.replace(/\D/g, '');
}

export function formatCuit(value: string) {
  const digits = normalizeCuit(value);
  return `${digits.slice(0, 2)}-${digits.slice(2, 10)}-${digits.slice(10)}`;
}

export function isValidCuit(value: unknown): boolean {
  if (typeof value !== 'string') {
    return false;
  }

  const digits = normalizeCuit(value);
  if (digits.length !== 11) {
    return false;
  }

  const sum = CUIT_WEIGHTS.reduce(
    (total, weight, index) => total + weight * Number(digits[index]),
    0,
  );
  const remainder = 11 - (sum % 11);
  const checkDigit = remainder === 11 ? 0 : remainder;

  return checkDigit !== 10 && checkDigit === Number(digits[10]);
}

export function IsCuit(validationOptions?: ValidationOptions) {
  return (target: object, propertyName: string) => {
    registerDecorator({
      name: 'isCuit',
      target: target.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate: (value: unknown) => isValidCuit(value),
        defaultMessage: () =>
          `${propertyName} must be a valid CUIT (11 digits with a matching check digit)`,
      },
    });
  };
}

/**
 * Accepts ISO 8601 as well as the `DD/MM/YYYY HH:mm` form used on the
 * "pedido de poliza" sheets, where an unqualified time means Argentine local time.
 */
export function parseIncomingDateTime(value: unknown): Date | unknown {
  if (typeof value !== 'string') {
    return value;
  }

  const trimmed = value.trim().replace(/\s*hs?\.?$|\s*hrs\.?$/i, '');
  const local = /^(\d{2})\/(\d{2})\/(\d{4})(?:[ T](\d{1,2}):(\d{2}))?$/.exec(trimmed);

  if (local) {
    const [, day, month, year, hour = '00', minute = '00'] = local;
    const offset = String(AR_UTC_OFFSET_HOURS).padStart(2, '0');
    const time = `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`;
    return new Date(`${year}-${month}-${day}T${time}:00.000-${offset}:00`);
  }

  const parsed = new Date(trimmed);
  return Number.isNaN(parsed.getTime()) ? value : parsed;
}

/** Sheet exports use `-` for "not applicable"; treat that as absent. */
export function optionalText(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return value as undefined;
  }

  const trimmed = value.trim();
  return trimmed === '' || trimmed === '-' ? undefined : trimmed;
}

export function requiredText(value: unknown): unknown {
  return typeof value === 'string' ? value.trim() : value;
}
