import type { SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { useAppTheme } from '../theme/app-theme';

export function SelectField(props: SelectHTMLAttributes<HTMLSelectElement>) {
  const { palette } = useAppTheme();

  return (
    <select
      {...props}
      style={{
        width: '100%',
        height: '40px',
        borderRadius: '8px',
        padding: '0 12px',
        background: palette.inputBg,
        border: `1px solid ${palette.inputBorder}`,
        color: palette.text,
        ...props.style,
      }}
    />
  );
}

export function TextAreaField(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { palette } = useAppTheme();

  return (
    <textarea
      {...props}
      style={{
        width: '100%',
        minHeight: '96px',
        borderRadius: '8px',
        padding: '10px 12px',
        background: palette.inputBg,
        border: `1px solid ${palette.inputBorder}`,
        color: palette.text,
        font: 'inherit',
        resize: 'vertical',
        ...props.style,
      }}
    />
  );
}
