export function parseCurrencyAmount(value: string, locale: string) {
  const parts = new Intl.NumberFormat(locale).formatToParts(12345.6);
  const groupSeparator = parts.find((part) => part.type === 'group')?.value;
  const decimalSeparator = parts.find((part) => part.type === 'decimal')?.value ?? '.';
  let normalized = '';
  let hasDecimal = false;

  for (const character of value) {
    if (/[0-9]/.test(character)) {
      normalized += character;
    } else if (character === decimalSeparator && !hasDecimal) {
      normalized += '.';
      hasDecimal = true;
    } else if (character !== groupSeparator) {
      continue;
    }
  }

  if (!normalized) return '';

  let [integerPart = '', fractionPart] = normalized.split('.');
  integerPart = integerPart.replace(/^0+(?=\d)/, '').slice(0, 13);
  if (fractionPart !== undefined) fractionPart = fractionPart.slice(0, 2);

  if (!integerPart && fractionPart !== undefined) integerPart = '0';
  return fractionPart === undefined ? integerPart : `${integerPart}.${fractionPart}`;
}

export function formatCurrencyAmount(value: string, locale: string) {
  if (!value) return '';

  const hasDecimal = value.includes('.');
  const [integerPart = '0', fractionPart = ''] = value.split('.');
  const formattedInteger = new Intl.NumberFormat(locale, {
    useGrouping: true,
    maximumFractionDigits: 0,
  }).format(Number(integerPart || '0'));
  const decimalSeparator = new Intl.NumberFormat(locale)
    .formatToParts(1.1)
    .find((part) => part.type === 'decimal')?.value ?? '.';

  return hasDecimal ? `${formattedInteger}${decimalSeparator}${fractionPart}` : formattedInteger;
}

export function formatMoney(amount: number, currency: string, locale: string) {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${new Intl.NumberFormat(locale, {
      useGrouping: true,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)}`;
  }
}

export function finalizeCurrencyAmount(value: string) {
  if (!value) return '';
  const [integerPart, fractionPart = ''] = value.split('.');
  return `${integerPart}.${fractionPart.slice(0, 2).padEnd(2, '0')}`;
}

export function getCurrencyAmountCaretPosition(
  value: string,
  digitsBeforeCaret: number,
  decimalBeforeCaret: boolean,
  locale: string,
) {
  if (decimalBeforeCaret) {
    const decimalSeparator = new Intl.NumberFormat(locale)
      .formatToParts(1.1)
      .find((part) => part.type === 'decimal')?.value ?? '.';
    const decimalIndex = value.indexOf(decimalSeparator);
    if (decimalIndex !== -1) return decimalIndex + decimalSeparator.length;
  }

  if (digitsBeforeCaret === 0) return 0;
  let digitsSeen = 0;
  for (let index = 0; index < value.length; index += 1) {
    if (/[0-9]/.test(value[index])) {
      digitsSeen += 1;
      if (digitsSeen === digitsBeforeCaret) return index + 1;
    }
  }
  return value.length;
}