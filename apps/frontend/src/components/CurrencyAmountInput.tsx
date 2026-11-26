import { Input, InputGroup } from '@chakra-ui/react';
import { useLayoutEffect, useRef, useState } from 'react';
import {
  finalizeCurrencyAmount,
  formatCurrencyAmount,
  getCurrencyAmountCaretPosition,
  parseCurrencyAmount,
} from './currency-amount';
import { useAppTheme } from '../theme/app-theme';

type CurrencyAmountInputProps = {
  value: string;
  currency: string;
  locale: string;
  onChange: (value: string) => void;
  required?: boolean;
};

export function CurrencyAmountInput({ value, currency, locale, onChange, required }: CurrencyAmountInputProps) {
  const { palette } = useAppTheme();
  const inputRef = useRef<HTMLInputElement>(null);
  const [pendingCaret, setPendingCaret] = useState<number | null>(null);
  const [focused, setFocused] = useState(false);
  const displayValue = formatCurrencyAmount(focused ? value : finalizeCurrencyAmount(value), locale);
  let currencySymbol = currency;
  try {
    currencySymbol = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      currencyDisplay: 'narrowSymbol',
    })
      .formatToParts(0)
      .find((part) => part.type === 'currency')?.value ?? currency;
  } catch {
    currencySymbol = currency;
  }

  useLayoutEffect(() => {
    if (pendingCaret === null) return;
    inputRef.current?.setSelectionRange(pendingCaret, pendingCaret);
    setPendingCaret(null);
  }, [displayValue, pendingCaret]);

  const handleChange = (inputValue: string, selectionStart: number | null) => {
    const caret = selectionStart ?? inputValue.length;
    const textBeforeCaret = inputValue.slice(0, caret);
    const digitsBeforeCaret = (textBeforeCaret.match(/[0-9]/g) ?? []).length;
    const decimalSeparator = new Intl.NumberFormat(locale)
      .formatToParts(1.1)
      .find((part) => part.type === 'decimal')?.value ?? '.';
    const decimalBeforeCaret = textBeforeCaret.includes(decimalSeparator);
    const nextValue = parseCurrencyAmount(inputValue, locale);
    const nextDisplayValue = formatCurrencyAmount(nextValue, locale);

    setPendingCaret(getCurrencyAmountCaretPosition(nextDisplayValue, digitsBeforeCaret, decimalBeforeCaret, locale));
    onChange(nextValue);
  };

  return (
    <InputGroup startElement={currencySymbol}>
      <Input
        ref={inputRef}
        type="text"
        inputMode="decimal"
        required={required}
        bg={palette.inputBg}
        borderColor={palette.inputBorder}
        value={displayValue}
        onChange={(event) => handleChange(event.target.value, event.target.selectionStart)}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setFocused(false);
          onChange(finalizeCurrencyAmount(value));
        }}
      />
    </InputGroup>
  );
}