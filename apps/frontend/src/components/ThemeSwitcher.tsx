import { HStack, SegmentGroup, Text } from '@chakra-ui/react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppTheme, type AppThemeMode } from '../theme/app-theme';

type ThemeSwitcherProps = {
  size?: 'sm' | 'md';
  showLabel?: boolean;
};

export function ThemeSwitcher({ size = 'sm', showLabel = false }: ThemeSwitcherProps) {
  const { t } = useTranslation();
  const { mode, setMode, palette, isToggleEnabled } = useAppTheme();

  const items = useMemo(
    () =>
      (['light', 'dark'] as const).map((value) => ({
        value,
        label: t(`theme.${value}`),
      })),
    [t],
  );

  if (!isToggleEnabled) {
    return null;
  }

  return (
    <HStack gap={3} align="center">
      {showLabel && (
        <Text
          fontSize="xs"
          color={palette.mutedText}
          textTransform="uppercase"
          letterSpacing="0.14em"
        >
          {t('common.theme')}
        </Text>
      )}
      <SegmentGroup.Root
        size={size}
        value={mode}
        onValueChange={(details) => {
          if (details.value) {
            setMode(details.value as AppThemeMode);
          }
        }}
        css={{
          bg: palette.surfaceAlt,
          borderRadius: 'full',
          p: '2px',
          borderWidth: '1px',
          borderColor: palette.border,
          color: palette.text,
          minHeight: '36px',
          '& [data-part="item"]': {
            minH: '32px',
            minW: '72px',
            borderRadius: 'full',
            px: '12px',
            fontWeight: '600',
            justifyContent: 'center',
          },
          '& [data-part="item"][data-state="checked"]': {
            color: palette.accentText,
          },
        }}
      >
        <SegmentGroup.Indicator
          css={{
            bg: palette.accent,
            borderRadius: 'full',
            boxShadow: 'sm',
          }}
        />
        <SegmentGroup.Items items={items} />
      </SegmentGroup.Root>
    </HStack>
  );
}
