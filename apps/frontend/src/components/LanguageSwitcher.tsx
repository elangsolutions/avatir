import { HStack, SegmentGroup, Text } from '@chakra-ui/react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { isLanguageToggleEnabled, supportedLanguages, type SupportedLanguage } from '../i18n';
import { useAppTheme } from '../theme/app-theme';

type LanguageSwitcherProps = {
  size?: 'sm' | 'md';
  showLabel?: boolean;
};

function resolveLanguage(language: string): SupportedLanguage {
  if (supportedLanguages.includes(language as SupportedLanguage)) {
    return language as SupportedLanguage;
  }

  const base = language.split('-')[0];
  if (supportedLanguages.includes(base as SupportedLanguage)) {
    return base as SupportedLanguage;
  }

  return 'es';
}

export function LanguageSwitcher({ size = 'sm', showLabel = false }: LanguageSwitcherProps) {
  const { i18n, t } = useTranslation();
  const { palette } = useAppTheme();

  const items = useMemo(
    () =>
      supportedLanguages.map((language) => ({
        value: language,
        label: t(`language.${language}Short`),
      })),
    [t],
  );

  const value = resolveLanguage(i18n.language);

  if (!isLanguageToggleEnabled) {
    return null;
  }

  return (
    <HStack gap={3} align="center">
      {showLabel && (
        <Text fontSize="xs" color={palette.mutedText} textTransform="uppercase" letterSpacing="0.14em">
          {t('common.language')}
        </Text>
      )}
      <SegmentGroup.Root
        size={size}
        value={value}
        onValueChange={(details) => {
          if (details.value) {
            void i18n.changeLanguage(details.value as SupportedLanguage);
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
            minW: '48px',
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
